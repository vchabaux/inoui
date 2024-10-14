const axios = require("axios");
const multer = require("multer");
const appModel = require("../models/App");
const upload = multer().array("images");
const FormData = require("form-data");

const proxyHttp = (
  proxyURL,
  options = {
    headers,
  }
) => {
  const instance = axios.create({
    baseURL: proxyURL,
    headers: options.headers,
    maxContentLength: 10000000000,
    maxBodyLength: 10000000000,
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
              formData.append("file", file.buffer, {
                filename: file.originalname,
              });
              return instance.post("/datas/uploads", formData);
            });

            const responses = await Promise.all(uploads);

            const parsedResponses = responses.map((r) => r.data);

            res.status(200).json(parsedResponses);
          } catch (err) {
            res.status(500).json(err);
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

module.exports = proxyHttp;
