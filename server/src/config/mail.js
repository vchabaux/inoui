require("dotenv/config");
const nodemailer = require("nodemailer");
const cfg = require("../config");
const hbs = require("handlebars");
const { readFile } = require("../utils");
// const template = require("../templates/mail/reset-password.hbs");

const generateTemplate = async (emailTemplate) => {
  const defaultLocation = `src/templates/mail/${emailTemplate}.hbs`;

  const templateString = await readFile(defaultLocation);

  const template = hbs.compile(templateString);

  const hydrated = template({ resetLink: "http://localhost:3000" });

  return hydrated;
};

const mailConfig = {};

async function initTransport() {
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    let testAccount = await nodemailer.createTestAccount();
    mailConfig.transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  } else {
    mailConfig.transport = nodemailer.createTransport({
      host: cfg.mailing.HOST,
      port: cfg.mailing.PORT,
      secure: false,
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
      // auth: {
      //   pass: cfg.mailing.PASSWORD,
      //   user: cfg.mailing.SENDER,
      // },
    });
  }

  mailConfig.transport.verify(function (error, success) {
    if (error) {
      console.log("error Connecting to the smtp server", error);
    } else {
      console.log("Mailing server is ready");
    }
  });
}

module.exports = {
  mailConfig,
  initTransport,
};
