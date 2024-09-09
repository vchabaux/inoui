const PlaylistService = require("../services/playlist.service");

exports.list = async (req, res, next) => {
  const playlists = await PlaylistService.list();

  res.status(200).json(playlists);
};

exports.findOne = async (req, res, next) => {
  const { id } = req.params;
  const playlist = await PlaylistService.findOne(id);

  if (!playlist)
    return res.status(404).json({ message: "Playlist does not exist" });

  return playlist;
};

exports.create = async (req, res, next) => {
  const data = req.body;

  data.author = req.user._id;

  const createdPlaylist = await PlaylistService.create(data);
  res.status(201).json(createdPlaylist);
};

exports.updateOne = async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  const updatedPlaylist = await PlaylistService.updateOne(id, data);
  res.status(200).json(updatedPlaylist);
};

exports.deleteOne = async (req, res, next) => {
  const { id } = req.params;

  await PlaylistService.deleteOne(id);
  res.sendStatus(204);
};
