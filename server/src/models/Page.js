const mongoose = require("mongoose");
const { Schema } = mongoose;

const pageSchema = new Schema(
  {
    slug: String,
    type: { type: String, enum: ["intro", "credits", "page"] },
    title: Schema.Types.Mixed,
    content: Schema.Types.Mixed,
    subtitle: Schema.Types.Mixed,
    video: String,
    audio: String,
  },
  { timestamps: true }
);

const PageModel = mongoose.model("Page", pageSchema);

module.exports = PageModel;
