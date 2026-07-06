const path = require("path");
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");

/**
 * On-disk storage for Nakala file uploads.
 *
 * Prompt 2a: files are persisted on disk as soon as the client selects them
 * (POST /nakala/temp-upload) instead of being buffered in RAM. The same
 * storage backs the legacy forward to Nakala (/datas/uploads), keeping big
 * files out of memory.
 */
const TEMP_UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "temp");

// Make sure the temp folder exists when the server boots.
fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Shared multer middleware (field name "images"). Used by this proxy AND by
// the temp-upload route so both write to the same folder with the same naming.
const upload = multer({ storage }).array("images");

const proxyHttp = (
  proxyURL,
  options = {
    headers,
  }
) => {
  const instance = axios.create({
    baseURL: proxyURL,
    headers: options.headers,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return async (req, res, next) => {
    const method = req.method.toLowerCase();

    if (req.is("multipart/form-data")) {
      upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return next("Multer Error");
        } else if (err) {
          console.error(err);
          return next(err);
        }

        if (req.files) {
          try {
            const uploads = req.files.map((file) => {
              const formData = new FormData();
              // Files now live on disk (diskStorage): stream them to Nakala
              // instead of buffering the whole payload in memory.
              formData.append("file", fs.createReadStream(file.path), {
                filename: file.originalname,
                contentType: file.mimetype,
                knownLength: file.size,
              });
              return instance.post("/datas/uploads", formData, {
                headers: formData.getHeaders(),
              });
            });

            const responses = await Promise.all(uploads);

            const parsedResponses = responses.map((r) => r.data);

            res.status(200).json(parsedResponses);
          } catch (err) {
            console.error(err);
            res.status(500).json(err);
          } finally {
            // Temp files have been forwarded to Nakala (or failed) — drop them.
            req.files.forEach((file) => {
              fs.unlink(file.path, () => {});
            });
          }
        }
      });
    } else {
      const url = req.originalUrl.split("/").slice(3).join("/");

      const data = req.body;

      const hasData = method !== "get" || method !== "delete";
      try {
        const response = await instance[method](
          url,
          hasData ? data : options,
          hasData ? options : null
        );

        res.status(200).json(response.data);
      } catch (err) {
        console.error(err.response && err.response.data);

        if (err.response) {
          res.status(err.response.status).json(err.response.data);
        } else {
          res.status(500).json(err);
        }
      }
    }
  };
};

// Expose the shared storage bits so the temp-upload route can reuse them.
proxyHttp.upload = upload;
proxyHttp.TEMP_UPLOAD_DIR = TEMP_UPLOAD_DIR;

module.exports = proxyHttp;
