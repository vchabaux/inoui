const config = require("../config");
const { readFile } = require("../utils");
const hbs = require("handlebars");
const providers = ["smtp", "sendgrid", "sendinblue"];
const { mailConfig: smtp, mailConfig } = require("../config/mail");
const nodemailer = require("nodemailer");

const generateTemplate = async (emailTemplate, data) => {
  const defaultLocation = `src/templates/mail/${emailTemplate}.hbs`;

  const templateString = await readFile(defaultLocation);

  const template = hbs.compile(templateString);

  const hydrated = template(data);

  return hydrated;
};

const defaultOptions = {
  provider: "smtp",
};

exports.sendMail = async (emailOrEmails, options) => {
  const opts = { ...defaultOptions, ...options };

  const transport = mailConfig.transport;

  const html = await generateTemplate(options.templateName, opts.data);

  const message = {
    from: `"Hello " <${config.mailing.SENDER}>`,
    to: emailOrEmails,
    subject: opts.subject || "No Subject",
    html,
  };

  return new Promise((resolve, reject) => {
    return transport.sendMail(message, (err, info) => {
      if (err) reject(err);
      else {
        console.log(info);
        if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        resolve(info);
      }
    });
  });
};
