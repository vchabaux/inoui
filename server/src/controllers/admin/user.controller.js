const UserService = require("../../services/user.service");
const bcrypt = require("bcrypt");
const config = require("../../config");

exports.list = async (req, res, next) => {
  const users = await UserService.list();

  res.status(200).json(users);
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  const user = await UserService.findOne(id);

  res.status(200).json(user);
};

exports.create = async (req, res, next) => {
  const data = req.body;

  const user = await UserService.create(data);
  res.status(200).json(user);
};

exports.updateOne = async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };
  delete data.password; // password updates go through changePassword (hashed)

  const user = await UserService.update(id, data);
  res.status(200).json(user);
};

exports.changePassword = async (req, res, next) => {
  const { password } = req.body;
  const { id } = req.params;

  if (!password) {
    const error = new Error("New password is required");
    error.status = 400;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, config.auth.SALT);

  await UserService.changePassword(id, hashedPassword);

  res.sendStatus(204);
};

exports.deleteOne = async (req, res, next) => {
  const { id } = req.params;

  await UserService.removeOne(id);

  res.sendStatus(204);
};
