const Asset = require("../models/Asset");

exports.list = (query = {}) => {
  return Asset.find(query);
};

exports.create = (data) => {
  return Asset.create(data);
};

exports.findOne = (id) => {
  return Asset.findOne({ _id: id });
};

exports.updateOne = (id, tags) => {
  return Asset.findByIdAndUpdate(id, { tags }, { new: true });
};

exports.deleteOne = (id) => {
  return Asset.findByIdAndDelete(id);
};
