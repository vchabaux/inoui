const mongoose = require("mongoose");

const { Schema } = mongoose;

const playlistSchema = new Schema(
  {
    order: {
      type: Number,
      required: true,
    },
    name: {
      type: Schema.Types.Mixed, //Mixed for i18n
    },
    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Node",
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
