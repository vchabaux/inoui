const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * For this project, set the URL as the full path with the app domain.
 * Make a seed file in order to change the urls with a different domain.
 * Eg migrate from https://example.com/image-name to https://toto.com/image-name
 */

const assetSchema = new Schema({
  type: {
    type: String,
    enum: ["local", "external"],
    default: "local",
  },

  mediaType: {
    type: String,
    enum: ["video", "image", "audio", "document"],
  },

  extension: {
    type: String,
  },

  mimetype: {
    type: String,
  },

  originalname: {
    type: String,
  },

  tags: [String],

  size: {
    type: Number,
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  url: {
    // Full path of image
    type: String,
    // required: true,
  },
});

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;
