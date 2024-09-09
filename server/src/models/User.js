const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },

    password: { type: String },

    name: { type: String, required: true },

    mailToken: { type: String },

    verified: { type: Boolean, default: false },

    previousEmail: { type: String },

    expiresAt: { type: Date, default: null },

    role: {
      type: String,
      enum: ["viewer", "editor", "admin", "superadmin"],
      default: "editor",
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
