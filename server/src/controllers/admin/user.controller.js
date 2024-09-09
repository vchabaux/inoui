const UserService = require("../../services/user.service");

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
  const data = req.body;
  const { id } = req.params;
  console.log(data);
  const user = await UserService.update(id, data);
  res.status(200).json(user);
};

exports.deleteOne = async (req, res, next) => {
  const { id } = req.params;

  await UserService.removeOne(id);

  res.sendStatus(204);
};
