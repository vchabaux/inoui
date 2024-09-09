const AppSettingsService = require("../services/appSettings.service");

exports.get = async (req, res, next) => {
  const appSettings = await AppSettingsService.get();
  res.status(200).json(appSettings);
};

exports.update = async (req, res, next) => {
  const data = req.body;

  const appSettings = await AppSettingsService.update(data);

  res.status(200).json(appSettings);
};
