const AppSettings = require("../models/App");

exports.get = () => {
  return AppSettings.findOne();
};

exports.update = async (data) => {
  await AppSettings.updateOne({}, data);

  return AppSettings.findOne({});
};
