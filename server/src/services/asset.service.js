const Asset = require("../models/Asset");

exports.list = (query = {}) => {
  // Most recent first: the ObjectId _id embeds the creation timestamp
  return Asset.find(query).sort({ _id: -1 });
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
