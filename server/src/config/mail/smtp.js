const nodemailer = require("nodemailer");
const cfg = require("../../config");

const transport = nodemailer.createTransport({
  host: cfg.mailing.HOST,
  port: cfg.mailing.PORT,
});

module.exports = {
  transport,
};
