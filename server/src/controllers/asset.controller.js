const AssetService = require("../services/asset.service");
const config = require("../config");
const { deleteFile } = require("../utils");
const assetTypes = {
  image: ["image/jpg", "image/jpeg", "image/png", "image/svg+xml"],
  video: ["video/mp4"],
  audio: ["video/mp3", "audio/mpeg"],
  document: ["application/pdf"],
};

const getAssetType = (mimetype) => {
  for (const key in assetTypes) {
    if (assetTypes[key].includes(mimetype)) {
      return key;
    }
  }
};

exports.list = async (req, res, next) => {
  const assets = await AssetService.list();

  res.status(200).json(assets);
};

exports.create = async (req, res, next) => {
  let tags = [];

  if (req.body.tags && !Array.isArray(req.body.tags)) {
    tags = [req.body.tags];
  }

  if (req.body.tags && Array.isArray(req.body.tags)) {
    tags = req.body.tags;
  }

  for (const file of req.files) {
    file.mediaType = getAssetType(file.mimetype);
    file.tags = tags;
    file.author = req.session.user;
  }

  const files = await AssetService.create(req.files);

  res.status(200).json(files);
};

exports.updateOne = async (req, res, next) => {
  const { id } = req.params;
  const { tags } = req.body;

  const asset = await AssetService.updateOne(id, tags);

  res.status(200).json(asset);
};

exports.removeOne = async (req, res, next) => {
  const { id } = req.params;

  const asset = await AssetService.findOne(id);

  const url = asset.url;

  const domain = config.app.url;

  const path = url.replace(domain + "/", "");

  await deleteFile(path).catch((err) => console.log("File does not exist"));

  await AssetService.deleteOne(id);

  res.sendStatus(204);
};
