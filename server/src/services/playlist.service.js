const Playlist = require("../models/Playlist");

exports.list = (query = {}) => {
  return Playlist.find(query).sort({ order: 1 });
};

exports.findOne = (id) => {
  return Playlist.findById(id);
};

exports.create = async (data) => {
  const playlists = await Playlist.find();

  data.order = playlists.length + 1;

  return Playlist.create(data);
};

exports.updateOne = (id, data) => {
  return Playlist.findByIdAndUpdate(id, data, { new: true });
};

exports.swapOrder = async (first, second) => {
  const [firstPlaylist, secondPlaylist] = await Promise.all([
    this.findOne(first),
    this.findOne(second),
  ]);

  const tempOrder = firstPlaylist.order;

  firstPlaylist.order = secondPlaylist.order;
  secondPlaylist.order = tempOrder;

  await Promise.all([firstPlaylist.save(), secondPlaylist.save()]);

  return [firstPlaylist, secondPlaylist];
};

exports.deleteOne = async (id) => {
  const currentPlaylist = await this.findOne(id);

  const allPlaylistsAbove = await this.list({
    order: { $gt: currentPlaylist.order },
  });

  const promises = allPlaylistsAbove.map((playlist) => {
    return Playlist.findByIdAndUpdate(playlist.id, {
      order: playlist.order - 1,
    });
  });

  await Promise.all(promises);

  return Playlist.findByIdAndDelete(id);
};
