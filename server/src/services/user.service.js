const UserModel = require("../models/User");

exports.list = (query = {}) => {
  return UserModel.find(query).select(["-password", "-mailToken"]).lean();
};

exports.create = (data) => {
  return UserModel.create(data);
};

exports.findOne = (id) => {
  return UserModel.findById(id).lean();
};

exports.getAccount = (id) => {
  return UserModel.findById(id).select(["-password", "-mailToken"]).lean();
};

exports.findByMail = (email) => {
  return UserModel.findOne({ email }).select(["-password", "-mailToken"]);
};

exports.findToken = (token) => {
  return UserModel.findOne({ mailToken: token }).select([
    "-password",
    "-mailToken",
  ]);
};

exports.update = async (id, data) => {
  return UserModel.findByIdAndUpdate(id, data, { new: true })
    .select(["-password", "-mailToken"])
    .lean();
};

exports.removeOne = async (id) => {
  return UserModel.findByIdAndRemove(id);
};

exports.changePassword = (id, password) => {};
