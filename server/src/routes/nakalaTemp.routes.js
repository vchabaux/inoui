const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
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

/**
 * Upload a single file to Nakala via the TUS protocol.
 *
 * 1. POST  {nakala}/tus/          – init, gets back Location (tus URL)
 * 2. PATCH {tusUrl} × N chunks    – upload in 15 MB blocks
 * 3. POST  {nakala}/file/cache    – resolve tusId → { name, sha1 }
 *
 * @returns {{ tusId, sha1, name }}
 */
async function tusUploadAndCache(filePath, fileName, mimeType, fileSize) {
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
    }
  } finally {
    await fd.close();
  }

  // ── Step 3: Resolve SHA1 (with retry + tolerant parse) ────
  let lastRaw = null;

  for (let attempt = 1; attempt <= 5; attempt++) {
    const cacheRes = await nakalaAxios.post(
      `${NAKALA_URL}/file/cache`,
      { ids: [tusId] },
      { headers: { "X-API-KEY": NAKALA_API_KEY } },
    );

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

    if (attempt < 5) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.error("Nakala /file/cache failed after 5 attempts for tusId", tusId, "last response:", JSON.stringify(lastRaw));
  throw new Error("Could not resolve SHA1 for TUS upload " + tusId);
}

/**
 * POST /nakala/publish
 *
 * Takes tempIds previously stored by POST /nakala/temp-upload, publishes
 * each file to Nakala via the TUS protocol, and creates a Nakala Data
 * with the supplied metadata.  On success the temp files are cleaned up;
 * on failure they are preserved so the caller can retry.
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

    // ── TUS-upload every file and grab SHA1 ───────────────────
    const uploadedFiles = [];
    for (const file of files) {
      const { tusId, sha1, name } = await tusUploadAndCache(
        file.path,
        file.originalname,
        file.mimetype,
        file.size,
      );
      uploadedFiles.push({ name, sha1, tusId });
    }

    // ── Build Nakala Data payload ─────────────────────────────
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

    // ── POST /datas ───────────────────────────────────────────
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

    // ── Link data to collection ──────────────────────────────
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

    // ── Cleanup: remove temp files and tempStore entries ──────
    for (const tempId of tempIds) {
      const entry = tempStore.get(tempId);
      if (entry) {
        entry.files.forEach((f) => fs.unlink(f.path, () => {}));
        tempStore.delete(tempId);
      }
    }

    return res.status(200).json({ identifier });
  } catch (err) {
    console.error("Nakala publish error:", err.response?.data || err.message);
    // Pass Nakala API errors through so the client can display them.
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: err.message });
  }
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
