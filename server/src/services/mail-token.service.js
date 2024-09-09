const MailToken = require("../models/MailToken");
const { generateMailToken } = require("../utils");

exports.create = async (userId, mail, token) => {
  await MailToken.deleteOne({ user: userId });

  const createdToken = await MailToken.create({
    user: userId,
    mail,
    token: token,
  });

  return createdToken;
};

exports.findToken = async (userId) => {
  return MailToken.findOne({ user: userId });
};
