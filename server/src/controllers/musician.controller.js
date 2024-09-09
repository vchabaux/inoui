const MusicianService = require("../services/musician.service");

exports.list = async (_, res) => {
  const musicians = await MusicianService.list();

  res.status(200).json(musicians);
};

exports.findOne = async (req, res) => {
  const { id } = req.params;

  const musician = await MusicianService.getOne(id);

  res.status(200).json(musician);
};

exports.create = async (req, res) => {
  const data = req.body;

  console.log(req.files, "these are the files ===>");

  const musician = await MusicianService.create(data);
  res.status(201).json(musician);
};

exports.updateOne = async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  console.log("These are the files  ===>>>, ", req.files);

  const musician = await MusicianService.updateOne(id, data);

  res.status(200).json(musician);
};

exports.deleteOne = async (req, res) => {
  const { id } = req.params;

  await MusicianService.deleteOne(id);
  res.sendStatus(204);
};
