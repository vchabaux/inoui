const attributes = {
  coordinates: { type: [Number], required: true },
  placeName: { type: String },
  notice: { type: Schema.Types.ObjectId, ref: "Notice" },
};
