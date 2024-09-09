const mongoose = require("mongoose");
const { Schema } = mongoose;

const mailTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  mail: {
    type: String,
    required: true,
  },

  expireAt: {
    type: Date,
    expires: 300, // Expires after 5 minutes,
    default: Date.now,
  },
});

const MailToken = mongoose.model("MailToken", mailTokenSchema);

module.exports = MailToken;
