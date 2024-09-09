const Notice = require("../models/Notice");

exports.list = (query = {}) => {
  return Notice.find(query)
    .populate({ path: "categories" })
    .populate({ path: "author", select: "-password" })
    .populate({ path: "updates.author", select: "-password" });
};

exports.getOne = (id) => {
  return Notice.findById(id)
    .populate({ path: "author", select: "-password" })
    .populate({ path: "updates.author", select: "-password" });
};

exports.create = (data) => {
  return Notice.create(data);
};

exports.update = (id, data) => {
  return Notice.findByIdAndUpdate(id, data, { new: true });
};

exports.updateMany = (filter, updateQuery) => {
  return Notice.updateMany(filter, updateQuery);
};

exports.removeOne = (id) => {
  return Notice.findByIdAndDelete(id);
};
