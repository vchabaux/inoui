const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { EventEmitter } = require("events");
const axios = require("axios");
const proxyHttp = require("../middlewares/proxyHttp");

// Dedicated instance for Nakala TUS calls.  The default axios limits
// maxBodyLength / maxContentLength, which would reject chunks approaching
// 15 MB even when the payload is legitimately large.
const nakalaAxios = axios.create({
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

const router = express.Router();

// Reuse the disk-storage multer configured in proxyHttp (same temp folder,
// UUID filenames). Keeps big files out of RAM and out of collisions.
const upload = proxyHttp.upload;

/**
 * In-memory index of pending temp uploads.
 *   tempId -> { files: [{ path, originalname, size, mimetype }], createdAt: Date }
 *
 * Prompt 2b will read from here (POST /nakala/publish) to forward the files
 * to Nakala and then remove the tempId.
 */
const tempStore = new Map();

const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// ── Nakala configuration (mirrors routes/index.js) ──────────────
const NAKALA_PROD_API_KEY = "11264a2b-1df9-46b5-af12-f6bdab7ef108";
const NAKALA_API_BASE = process.env.NAKALA_API_BASE || "https://api.nakala.fr";
const NAKALA_URL = NAKALA_API_BASE;
const NAKALA_API_KEY = process.env.NAKALA_API_KEY || NAKALA_PROD_API_KEY;
const TUS_CHUNK_SIZE = 15 * 1024 * 1024; // 15 MB

// ── Async job registry for POST /nakala/publish ─────────────────
//   jobId -> { status, phase, percent, message, result, error, emitter }
const jobs = new Map();

/**
 * Upload a single file to Nakala via the TUS protocol.
 *
 * 1. POST  {nakala}/tus/          – init, gets back Location (tus URL)
 * 2. PATCH {tusUrl} × N chunks    – upload in 15 MB blocks
 * 3. POST  {nakala}/file/cache    – resolve tusId → { name, sha1 }  (exponential backoff)
 *
 * @param {string}  filePath   – local disk path
 * @param {string}  fileName   – original filename
 * @param {string}  mimeType   – MIME type
 * @param {number}  fileSize   – total bytes
 * @param {object}  [emitter]  – optional EventEmitter for progress/phase events
 * @param {number}  [totalBytes] – total bytes across all files (for cumulative progress)
 * @param {number}  [loadedBytes] – bytes already uploaded from previous files
 * @returns {{ tusId, sha1, name }}
 */
async function tusUploadAndCache(filePath, fileName, mimeType, fileSize, emitter, totalBytes, loadedBytes) {
  const enc = (s) => Buffer.from(s, "utf-8").toString("base64");
  const metadata = `filename ${enc(fileName)},filetype ${enc(mimeType)}`;

  // ── Step 1: Init ────────────────────────────────────────────
  const initRes = await nakalaAxios.post(
    `${NAKALA_URL}/tus/`,
    null,
    {
      headers: {
        "X-API-KEY": NAKALA_API_KEY,
        "Upload-Length": fileSize,
        "Upload-Metadata": metadata,
        "Tus-Resumable": "1.0.0",
      },
    },
  );

  const location = initRes.headers.location;
  if (!location) throw new Error(`TUS init returned no Location header`);

  const tusUrl = location.startsWith("http") ? location : `${NAKALA_URL}${location}`;
  const tusId = tusUrl.split("/").pop();

  // ── Step 2: Chunked upload ──────────────────────────────────
  const fd = await fs.promises.open(filePath, "r");
  try {
    let offset = 0;
    const buf = Buffer.alloc(TUS_CHUNK_SIZE);

    while (offset < fileSize) {
      const want = Math.min(TUS_CHUNK_SIZE, fileSize - offset);
      const { bytesRead } = await fd.read(buf, 0, want, offset);
      const chunk = buf.subarray(0, bytesRead);

      await nakalaAxios.patch(tusUrl, chunk, {
        headers: {
          "X-API-KEY": NAKALA_API_KEY,
          "Upload-Offset": offset,
          "Content-Type": "application/offset+octet-stream",
          "Tus-Resumable": "1.0.0",
        },
        // Do not let axios set a default Content-Type, ours is explicit.
        // maxContentLength / maxBodyLength are not needed for PATCH.
      });

      offset += chunk.length;

      // Emit cumulative progress across all files in the job
      if (emitter && totalBytes > 0) {
        const cumulative = (loadedBytes || 0) + offset;
        const percent = Math.round((cumulative / totalBytes) * 100);
        emitter.emit("progress", { phase: "uploading", percent });
      }
    }
  } finally {
    await fd.close();
  }

  // ── Step 3: Resolve SHA1 (exponential backoff + tolerant parse) ──
  if (emitter) {
    emitter.emit("progress", { phase: "hashing", percent: null });
  }

  let lastRaw = null;
  const maxAttempts = 15;
  let delay = 2000; // 2s initial

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let cacheRes;
    try {
      cacheRes = await nakalaAxios.post(
        `${NAKALA_URL}/file/cache`,
        { ids: [tusId] },
        { headers: { "X-API-KEY": NAKALA_API_KEY } },
      );
    } catch (err) {
      // Real HTTP error (e.g. 404, 500) — fail fast, don't retry
      throw new Error(
        `Nakala /file/cache HTTP error for tusId ${tusId}: ${err.response?.status} ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`,
      );
    }

    lastRaw = cacheRes.data;

    const sha1 =
      lastRaw?.data?.[0]?.sha1 ??
      lastRaw?.[0]?.sha1 ??
      lastRaw?.payload?.[0]?.sha1 ??
      lastRaw?.sha1 ??
      lastRaw?.data?.sha1;

    if (sha1) {
      const name =
        lastRaw?.data?.[0]?.name ??
        lastRaw?.[0]?.name ??
        lastRaw?.payload?.[0]?.name ??
        lastRaw?.name ??
        lastRaw?.data?.name ??
        fileName;

      return { tusId, sha1, name };
    }

    // SHA1 not yet computed — wait with exponential backoff
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 180000); // cap at 3 minutes
    }
  }

  console.error(
    "Nakala /file/cache failed after", maxAttempts, "attempts for tusId",
    tusId, "last response:", JSON.stringify(lastRaw),
  );
  throw new Error("Could not resolve SHA1 for TUS upload " + tusId);
}

/**
 * Run the full publish pipeline in the background.
 *
 * @param {string}          jobId
 * @param {object}          job      – entry in the jobs Map
 * @param {Array<object>}   files    – files from tempStore [{ path, originalname, size, mimetype }]
 * @param {object}          metadata – all form fields + tempIds
 */
async function runPublishJob(jobId, job, files, metadata) {
  const {
    effectiveCollectionId, title, description, language, license,
    metas, keywords, tempIds,
  } = metadata;

  try {
    job.status = "uploading";

    // ── Compute total bytes for cumulative progress ──
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    let loadedBytes = 0;

    // ── TUS-upload every file and grab SHA1 ──
    const uploadedFiles = [];
    for (const file of files) {
      const { tusId, sha1, name } = await tusUploadAndCache(
        file.path,
        file.originalname,
        file.mimetype,
        file.size,
        job.emitter,
        totalBytes,
        loadedBytes,
      );
      uploadedFiles.push({ name, sha1, tusId });
      loadedBytes += file.size;
    }

    // ── Phase: creating data ──
    job.status = "creating";
    job.phase = "creating";
    job.percent = null;
    job.emitter.emit("progress", { phase: "creating", percent: null });

    // ── Build Nakala Data payload ──
    const licenseCode = typeof license === "string" ? license : license?.code;

    const dataBody = {
      files: uploadedFiles,
      status: "published",
      collectionIds: [effectiveCollectionId],
      metas: [
        {
          value: title,
          lang: language,
          typeUri: "http://www.w3.org/2001/XMLSchema#string",
          propertyUri: "http://nakala.fr/terms#title",
        },
        {
          value: licenseCode,
          typeUri: "http://www.w3.org/2001/XMLSchema#string",
          propertyUri: "http://nakala.fr/terms#license",
        },
        {
          value: "http://purl.org/coar/resource_type/c_c513",
          typeUri: "http://www.w3.org/2001/XMLSchema#anyURI",
          propertyUri: "http://nakala.fr/terms#type",
        },
        {
          value: null,
          lang: language,
          typeUri: "http://www.w3.org/2001/XMLSchema#Name",
          propertyUri: "http://nakala.fr/terms#creator",
        },
        {
          value: null,
          typeUri: null,
          propertyUri: "http://nakala.fr/terms#created",
        },
        {
          value: description,
          lang: language,
          typeUri: "http://www.w3.org/2001/XMLSchema#string",
          propertyUri: "http://purl.org/dc/terms/description",
        },
        ...(metas || []),
        ...(keywords || []),
      ],
    };

    // ── POST /datas ──
    const dataRes = await axios.post(`${NAKALA_URL}/datas`, dataBody, {
      headers: {
        "X-API-KEY": NAKALA_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const identifier = dataRes.data?.payload?.id;
    if (!identifier) {
      throw new Error("Nakala data creation returned no payload.id");
    }

    // ── Link data to collection ──
    await axios.post(
      `${NAKALA_URL}/collections/${effectiveCollectionId}/datas`,
      [identifier],
      {
        headers: {
          "X-API-KEY": NAKALA_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    // ── Cleanup: remove temp files and tempStore entries ──
    for (const tempId of tempIds) {
      const entry = tempStore.get(tempId);
      if (entry) {
        entry.files.forEach((f) => fs.unlink(f.path, () => {}));
        tempStore.delete(tempId);
      }
    }

    // ── Success ──
    job.status = "done";
    job.result = { identifier };
    job.emitter.emit("done", { identifier });
  } catch (err) {
    const message = err.response?.data || err.message;
    console.error("Nakala publish error:", err.response?.data || err.message);

    job.status = "error";
    job.error = message;
    job.emitter.emit("error", { message });

    // On failure: DO NOT delete temp files, so the client can retry.
    // tempStore entries persist as well.
  }
}

/**
 * POST /nakala/publish
 *
 * Takes tempIds previously stored by POST /nakala/temp-upload, publishes
 * each file to Nakala via the TUS protocol, and creates a Nakala Data
 * with the supplied metadata.  Returns { jobId } immediately; the actual
 * processing runs asynchronously.  Subscribe to the SSE endpoint
 * GET /nakala/publish/:jobId/stream to track progress.
 */
router.post("/publish", async (req, res, next) => {
  try {
    const { tempIds, collectionId: reqCollectionId, title, description, language, license, metas, keywords } =
      req.body;
    const effectiveCollectionId = process.env.NAKALA_TEST_COLLECTION_ID || reqCollectionId;

    // ── Validate ──────────────────────────────────────────────
    if (!tempIds || !Array.isArray(tempIds) || tempIds.length === 0) {
      return res.status(400).json({ message: "tempIds must be a non-empty array" });
    }
    if (!reqCollectionId) {
      return res.status(400).json({ message: "collectionId is required" });
    }

    // ── Collect files from tempStore ──────────────────────────
    const files = [];
    for (const tempId of tempIds) {
      const entry = tempStore.get(tempId);
      if (!entry) {
        return res.status(400).json({
          message: `File with tempId ${tempId} not found or expired — please re-upload`,
        });
      }
      files.push(...entry.files);
    }

    // ── Create async job ──────────────────────────────────────
    const jobId = uuidv4();
    const emitter = new EventEmitter();

    // Remove emitter listeners when nobody is listening anymore
    emitter.setMaxListeners(100);

    const job = {
      status: "pending",
      phase: null,
      percent: null,
      message: null,
      result: null,
      error: null,
      emitter,
    };
    jobs.set(jobId, job);

    // Respond immediately
    res.status(200).json({ jobId });

    // Launch background processing (no await)
    runPublishJob(jobId, job, files, {
      effectiveCollectionId, title, description, language, license, metas, keywords, tempIds,
    }).catch((err) => {
      // Safety net: if runPublishJob throws synchronously (shouldn't, but just in case)
      console.error("Unhandled error in runPublishJob:", err);
      if (job.status !== "error" && job.status !== "done") {
        job.status = "error";
        job.error = err.message;
        job.emitter.emit("error", { message: err.message });
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /nakala/publish/:jobId/stream
 *
 * SSE endpoint: streams progress, done, and error events for an async publish job.
 */
router.get("/publish/:jobId/stream", (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ message: "unknown job" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send an initial comment to establish the connection
  res.write(":ok\n\n");

  const onProgress = (payload) => {
    res.write(`event: progress\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const onDone = (payload) => {
    res.write(`event: done\ndata: ${JSON.stringify(payload)}\n\n`);
    res.end();
  };

  const onError = (payload) => {
    res.write(`event: error\ndata: ${JSON.stringify(payload)}\n\n`);
    res.end();
  };

  job.emitter.on("progress", onProgress);
  job.emitter.on("done", onDone);
  job.emitter.on("error", onError);

  req.on("close", () => {
    job.emitter.off("progress", onProgress);
    job.emitter.off("done", onDone);
    job.emitter.off("error", onError);
  });
});

/**
 * POST /nakala/temp-upload
 *
 * Stores the selected files on disk and returns one entry per file. All files
 * in a single request share the same tempId, which the client reuses later to
 * publish them. Each entry mirrors what the client needs to render the file
 * plus the server-side path used for cleanup / publishing.
 */
router.post("/temp-upload", upload, (req, res, next) => {
  try {
    const files = (req.files || []).map((file) => ({
      path: file.path,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    // One non-predictable id per upload batch.
    const tempId = uuidv4();
    tempStore.set(tempId, { files, createdAt: new Date() });

    const response = files.map((file) => ({
      tempId,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
    }));

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * Sweep expired temp uploads: delete the files from disk and drop the Map
 * entry. Runs every 15 min; `.unref()` lets the process exit normally.
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [tempId, entry] of tempStore) {
    if (now - entry.createdAt.getTime() > MAX_AGE_MS) {
      entry.files.forEach((file) => {
        fs.unlink(file.path, () => {});
      });
      tempStore.delete(tempId);
    }
  }
}, CLEANUP_INTERVAL_MS);
cleanupInterval.unref();

module.exports = router;
module.exports.tempStore = tempStore;