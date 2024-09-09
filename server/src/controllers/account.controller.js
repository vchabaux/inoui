const UserService = require("../services/user.service");
const EmailService = require("../services/email.service");
const { generateToken, verfiyToken, generateMailToken } = require("../utils");
const config = require("../config");
const bcrypt = require("bcrypt");
const { catchErrors } = require("../middlewares");
const MailTokenService = require("../services/mail-token.service");

const appDomain =
  process.env.NODE_ENV === "development"
    ? config.app.allowedDomains[0]
    : config.app.url;

exports.getUser = async (req, res, next) => {
  const user = req.user;
  res.status(200).json(user);
};

exports.requestChangePassword = async (req, res, next) => {
  const { email } = req.body;

  const foundUser = await UserService.findByMail(email);

  if (!foundUser) {
    const error = new Error("acc:no.account");
    error.status = 400;
    return next(error);
  }

  const token = generateToken({}, "10m");

  await EmailService.sendMail(email, {
    templateName: "reset-password",
    subject: "Changement de mot de passe",
    data: {
      resetLink: `${appDomain}/password-reset?token=${token}`,
    },
  });

  foundUser.mailToken = token;

  await foundUser.save();

  res.status(200).json({ message: "Mail Sent" });
};

exports.changePassword = async (req, res, next) => {
  const { password, token } = req.body;

  try {
    verfiyToken(token);
  } catch (err) {
    if (err.message === "jwt expired") {
      const error = new Error("acc:token-expired");
      error.status = 400;
      next(error);
    }
  }

  const foundUser = await UserService.findToken(token);

  if (!foundUser) {
    const error = new Error("acc:no.account");
    error.status = 400;
    return next(error);
  }

  // TODO Verify token expiration

  const hashedPassword = await bcrypt.hash(password, config.auth.SALT);
  foundUser.password = hashedPassword;
  foundUser.verified = true;

  foundUser.mailToken = null;

  await foundUser.save();

  res.status(200).json({ message: "Success" });
};

exports.createAccount = async (req, res, next) => {
  const data = req.body;

  const foundUser = await UserService.findByMail(data.email);

  if (foundUser) {
    const error = new Error("acc:user-exists");
    error.status = 400;
    return next(error);
  }

  const token = generateToken({}, "5 days");

  data.mailToken = token;

  const createdUser = await UserService.create(data);

  await EmailService.sendMail(createdUser.email, {
    templateName: "account-invitation",
    subject: "Invitation",
    data: {
      invitationLink: `${appDomain}/account-invitation?token=${token}`,
    },
  });

  res.status(200).json(createdUser);
};

exports.verifyPassword = async (req, res, next) => {
  const { password } = req.body;

  const { _id } = req.user;

  const foundUser = await UserService.findOne(_id);

  const isValidPassword = await bcrypt
    .compare(password, foundUser.password)
    .catch(() => {});

  if (!isValidPassword) {
    const error = new Error("Bad password");
    error.status = 400;
    return next(error);
  }

  res.status(200).json({ message: "Valid password" });
};

exports.updateAccount = async (req, res, next) => {
  const { name } = req.body;

  const user = await UserService.update(req.user._id, { name });

  res.status(200).json(user);
};

exports.requestEmailChange = async (req, res, next) => {
  const { _id } = req.user;
  const { email: newEmail } = req.body;

  const token = generateToken({ email: newEmail }, "30m");

  await UserService.update(_id, { mailToken: token });

  await EmailService.sendMail(newEmail, {
    templateName: "confirm-email",
    subject: "Confirm email",
    data: {
      confirmationLink: `${appDomain}/email?token=${token}`,
    },
  });

  res.status(200).json({ message: "Success" });
};

exports.createMailToken = async (req, res, next) => {
  const { mail } = req.body;
  const { _id } = req.user;

  const foundUser = await UserService.findByMail(mail);

  if (foundUser) {
    const error = new Error(`Email already taken`);
    error.status = 400;
    return next(error);
  }

  const token = generateMailToken();

  await MailTokenService.create(_id, mail, token);

  await EmailService.sendMail(mail, {
    templateName: "confirm-email",
    subject: "Confirm email",
    data: {
      token: token,
    },
  });

  res.status(201).json({ message: "Mail token sent" });
};

exports.mailToken = async (req, res, next) => {
  const token = await MailTokenService.findToken(req.user._id);

  if (token) res.status(200).json({ message: "Token requested." });
  else res.status(400).json({ message: "No active token" });
};

exports.validateCode = async (req, res, next) => {
  const { code } = req.body;
  const { _id } = req.user;

  const foundToken = await MailTokenService.findToken(_id);

  if (!foundToken) {
    const error = new Error(`Token has expired`);
    error.status = 400;
    return next(error);
  }

  const isValidCode = foundToken.token === code;

  if (!isValidCode) {
    const error = new Error(`Invalid code`);
    error.status = 400;
    return next(error);
  }

  const user = await UserService.update(_id, { email: foundToken.mail });

  res.status(200).json(user);
};

exports.updatePassword = async (req, res, next) => {
  const { password, newPassword } = req.body;
  const { _id } = req.user;

  const foundUser = await UserService.findOne(_id);

  const isValidPassword = bcrypt
    .compare(password, foundUser.password)
    .catch((err) => {});

  if (!isValidPassword) {
    const error = new Error(`Bad credentials`);
    error.status = 400;
    return next(error);
  }

  await UserService.update(_id, {
    password: await bcrypt.hash(newPassword, config.auth.SALT),
  });

  res.status(200).json({ message: "Password updated" });
};

exports.changeEmail = async (req, res, next) => {
  res.status(200).json({ message: "Mail changed !" });
};
