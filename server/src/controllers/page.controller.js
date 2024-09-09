const { Schema } = require("mongoose");
const PageService = require("../services/page.service");

exports.list = async (req, res, next) => {
  const pages = await PageService.list();

  res.status(200).json(pages);
};
exports.findOne = async (req, res, next) => {
  const page = await PageService.findOne(id);

  res.status(200).json(page);
};

exports.updateOne = async (req, res, next) => {
  const data = req.body;
  const { id } = req.params;

  const page = await PageService.update(id, data);
  res.status(200).json(page);
};
