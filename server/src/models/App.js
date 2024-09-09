const mongoose = require("mongoose");
const { Schema } = mongoose;

const appSchema = new Schema(
  {
    name: { type: String },
    domain: { type: String },
    project: { type: String },

    map: {
      mapStyle: { type: String, default: "mapbox://styles/mapbox/streets-v11" },
      center: [Number],
      zoom: Number,
      appAudio: String,
      distanceAudio: Number,
      distanceMarker: Number,
    },

    playlist: { type: Schema.Types.ObjectId, ref: "Playlist" },

    storage: {
      destination: {
        type: String,
        enum: ["local", "nakala"],
        default: "local",
      },
    },

    nakala: {
      apiKey: String,
      collection: String,
      assetMetas: [{ type: Schema.Types.Mixed }],
      language: { type: Schema.Types.Mixed },
      licenses: [{ type: Schema.Types.Mixed }],
    },
  },
  { timestamps: true }
);

const AppModel = mongoose.model("App", appSchema);

module.exports = AppModel;
