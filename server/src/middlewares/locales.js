const config = require("../config");

/**
 * TODO Make locales package.
 */

const defaultOptions = {
  language: "en",
  type: null,
};

const locales = (req, res, next) => {
  res.locales = function (namespace, data, options = {}) {
    const opts = { ...defaultOptions, ...options };

    let message;

    const lang = req.headers["accept-language"] || opts.language;

    if (opts.type === "error") {
      message =
        lang in config.locales.errors
          ? config.locales.errors[lang][namespace]
          : config.locales.errors[defaultOptions.language][namespace];
    } else {
      message =
        lang in config.locales.responses
          ? config.locales.responses[lang][namespace]
          : config.locales.responses[defaultOptions.language][namespace];
    }

    res.status(200).json({ message });
  };
  next();
};

module.exports = locales;
