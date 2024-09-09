const Musician = require("../models/Musician");

exports.list = (query = {}) => {
  return Musician.find(query);
};

exports.getOne = (id) => {
  return Musician.findById(id);
};

exports.create = (data) => {
  return Musician.create(data);
};

exports.updateOne = (id, data) => {
  return Musician.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteOne = (id) => {
  return Musician.findByIdAndDelete(id);
};
