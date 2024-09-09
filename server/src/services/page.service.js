const Page = require("../models/Page");

exports.list = (query = {}) => {
  return Page.find(query);
};

exports.getOne = (id) => {
  return Page.findById(id);
};

exports.update = (id, data) => {
  return Page.findByIdAndUpdate(id, data, { new: true });
};