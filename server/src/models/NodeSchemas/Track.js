const attributes = {
  media: { type: Schema.Types.ObjectId, ref: "Media" },
  musician: { type: Schema.Types.ObjectId, ref: "Musician" },
  color: { type: String },
  transparence: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  isWalking: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "published", "pending"], default: "draft" },
};
