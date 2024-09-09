const { Schema } = require("mongoose");
const NoticeService = require("../services/notice.service");
const NodeService = require("../services/node.service");

exports.list = async (req, res, next) => {
  const notices = await NoticeService.list();

  res.status(200).json(notices);
};
exports.findOne = async (req, res, next) => {
  const { id } = req.params;
  const notice = await NoticeService.findOne(id);

  res.status(200).json(notice);
};

exports.create = async (req, res, next) => {
  const data = req.body;

  data.author = req.user._id; // Read from session instead of trusting user sending the correct author.

  const notice = await NoticeService.create(data);
  res.status(200).json(notice);
};

exports.updateOne = async (req, res, next) => {
  const data = req.body;
  const { id } = req.params;

  const notice = await NoticeService.update(id, data);
  res.status(200).json(notice);
};

exports.deleteOne = async (req, res, next) => {
  const { id } = req.params;

  await NoticeService.updateMany(
    { references: id },
    { $pull: { references: id } }
  );

  const allPointsWithNotice = await NodeService.findByQuery({
    context: "Point",
    "attributes.notice.value": id,
  });

  allPointsWithNotice.forEach(async (node) => {
    const { notice, ...rest } = node.attributes;
    await NodeService.updateData(node._id, rest);
  });

  await NoticeService.removeOne(id);

  res.sendStatus(204);
};
