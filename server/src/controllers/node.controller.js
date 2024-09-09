const NodeService = require("../services/node.service");
const { isValidObjectId } = require("mongoose");
const { nodePlugin } = require("../node-plugin/index");

exports.list = async (req, res, next) => {
  const { type, context } = req.query;

  const getType = {
    leaves: NodeService.getLeaf,
    branches: NodeService.getBranches,
    roots: NodeService.getRoots,
  };

  const nodes = await getType[type](type === "roots" ? context : undefined);

  res.status(200).json(nodes);
};

exports.findOne = async (req, res, next) => {
  const { id } = req.params;

  const node = await NodeService.getOneById(id);

  if (!isValidObjectId(id)) {
    const error = new Error(`Invalid ObjectID`);
    next(error);
  }

  if (!node) {
    const error = new Error(`No element with id: ${id} was found`);
    next(error);
  }

  res.status(200).json(node);
};

exports.create = async (req, res, next) => {
  const { type } = req.query;
  const { parentId, ...data } = req.body;

  await nodePlugin.executeFunctions(data.context, "before", "create", {
    service: NodeService,
    body: req.body,
    req: req,
  });

  if (!type) {
    const error = new Error(
      `No type provided, either set params type as root or child`
    );
    error.status = 400;
    return next(error);
  }

  let node;

  if (type === "root") {
    node = await NodeService.createRoot(data);
  } else if (type === "child") {
    node = await NodeService.createNode(parentId, data);
  }

  await nodePlugin.executeFunctions(data.context, "after", "create", {
    service: NodeService,
    body: req.body,
  });

  res.status(201).json(node);
};

exports.update = async (req, res, next) => {
  const { name, attributes } = req.body;
  const { id } = req.params;

  let updatedNode;

  if (name) {
    updatedNode = await NodeService.updateNodeName(id, name);
  }

  if (attributes) {
    updatedNode = await NodeService.updateData(id, attributes);
  }

  res.status(200).json(updatedNode);
};

exports.updateAttr = async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  const updatedNode = await NodeService.updateNodeData(id, data);
  res.status(200).json(updatedNode);
};

exports.updateName = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const updatedNode = await NodeService.updateNodeName(id, name);
  res.status(200).json(updatedNode);
};

exports.moveNode = async (req, res, next) => {
  const { id } = req.params;
  const { target } = req.body;

  await NodeService.moveNode(id, target);
  res.status(200).json({ message: "Success" });
};

exports.swapNode = async (req, res, next) => {
  const { first, second } = req.params;

  await NodeService.swapNodes(first, second);

  res.status(200).json({ message: "Success" });
};

exports.deleteOne = async (req, res, next) => {
  const { id } = req.params;
  await NodeService.removeNode(id);
  res.sendStatus(204);
};
