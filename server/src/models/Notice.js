const mongoose = require("mongoose");
const { Schema } = mongoose;

const noticeSchema = new Schema(
  {
    title: Schema.Types.Mixed,
    hasTitle: { type: Boolean, default: true },
    status: { type: String, enum: ["draft", "published", "pending"], default: "draft" },
    
    author: { type: Schema.Types.ObjectId, ref: "User" },
    date: Date,
    updates: [{ author: { type: Schema.Types.ObjectId, ref: "User" }, date: Date }],
    
    content: Schema.Types.Mixed,
    mediaTypes: [{ type: String, enum: ["text", "image", "audio", "video"] }],
    categories: [{ type: Schema.Types.ObjectId, ref: "Node" }],

    original: { type: Schema.Types.ObjectId, ref: "Notice" },
    references: [{ type: Schema.Types.ObjectId, ref: "Notice" }],
  },
  { timestamps: true }
);

const NoticeModel = mongoose.model("Notice", noticeSchema);

module.exports = NoticeModel;
