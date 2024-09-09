const { saveFile } = require("../utils");
const { v4: uuid } = require("uuid");
const path = require("path");
const config = require("../config");

/**
 *
 * @param {string} location
 * @param {Object} options
 */
exports.assetManager = (location, options) => {
  return async (req, res, next) => {
    const { files } = req;

    for (const file of files) {
      const { originalname } = file;

      const { ext } = path.parse(originalname);
      const newName = uuid() + ext;

      const fileLocation = path.join(location, newName);
      await saveFile(fileLocation, file.buffer);

      // Check mimetype too, if it's video or audio, save straight to disc.
      // Check options for image versions
      file.url = config.app.url + "/" + fileLocation;
      delete file.buffer;
      delete file.fieldname;
    }

    next();
  };
};
