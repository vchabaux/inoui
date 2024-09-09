const mongoose = require("mongoose");
const { Schema } = mongoose;

const markerSchema = new Schema(
  {
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const Marker = mongoose.model("Marker", markerSchema);

module.exports = Marker;
