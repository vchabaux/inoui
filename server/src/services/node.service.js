const mongoose = require("mongoose");
const Node = require("../models/Node");
const { buildPath } = require("../utils");
const { isValidObjectId } = mongoose;

const populateAttributes = async (
  element,
  excludes,
  recursiveKey = "children"
) => {
  if (!element[recursiveKey]) return;

  for (const attr in element.attributes) {
    if (element.attributes[attr].ref) {
      const refElement = element.attributes[attr];

      if (Array.isArray(refElement.value)) {
        const modelName = refElement.ref;
        const elements = refElement.value;

        if (!elements.length) return;

        const foundElements = await mongoose
          .model(modelName)
          .find({ _id: { $in: elements } })
          .select(excludes);

        element.attributes[attr] = foundElements;
      } else {
        if (!refElement.value) return;

        const foundElement = await mongoose
          .model(refElement.ref)
          .findOne({ _id: refElement.value })
          .select(excludes);
        element.attributes[attr] = foundElement && foundElement.toObject();
      }
    }
  }

  for (const child of element[recursiveKey]) {
    await populateAttributes(child, ["-password", "-mailToken"]);
  }
};

/**
 * This should get the root and the entire tree
 * @returns
 */
exports.getRoot = () => {
  return Node.findOne({ parent: null });
};

const defaultOptions = {
  populate: true,
};

exports.getRoots = async (context = null, options = {}) => {
  const opts = { ...defaultOptions, ...options };

  const q = context ? { parent: null, context } : { parent: null };

  const roots = await Node.find(q, null, {
    skipMiddleware: !opts.populate,
  });

  for (const root of roots) {
    await populateAttributes(root, ["-password", "-mailToken"]);
  }

  return roots;
};

exports.getLeaf = (options) => {
  const opts = { ...defaultOptions, ...options };
  return Node.find(
    { $or: [{ children: null, children: { $size: 0 } }] },
    null,
    {
      skipMiddleware: !opts.populate,
    }
  );
};

exports.getBranches = (options) => {
  const opts = { ...defaultOptions, ...options };
  return Node.find({ $expr: { $gte: [{ $size: "children" }, 1] } }, null, {
    skipMiddleware: !opts.populate,
  });
};

exports.getSiblings = (parentId, options) => {
  const opts = { ...defaultOptions, ...options };

  return Node.find({ parent: parentId }, null, {
    skipMiddleware: !opts.populate,
  });
};

exports.getOneById = (id, options) => {
  const opts = { ...defaultOptions, ...options };

  return Node.findById(id, null, {
    skipMiddleware: !opts.populate,
  });
};

exports.findByQuery = (query = {}) => {
  return Node.find(query);
};

exports.updateData = (elementId, data) => {
  return Node.findByIdAndUpdate(elementId, { attributes: data }, { new: true });
};

/**
 *
 * getOneByName is used only for testing purposes.
 * DO NOT USE THIS
 * Nodes can have the same name, so you might not get what
 * you expect to have as mongoose will return the first occurence.
 *
 */
exports.getOneByName = (name) => {
  return Node.findOne({ name });
};

exports.createRoot = (elementData) => {
  const { name, context, attributes = {} } = elementData;

  if (!name || !context) {
    throw Error(`You must provide a name and a context for the node`);
  }

  return Node.create({
    name,
    attributes,
    context,
    path: buildPath(name),
    parent: null,
  });
};

exports.createNode = async (parentId, elementData) => {
  const { name, context, attributes = {} } = elementData;

  if (!name || !context) {
    throw Error(`You must provide a name and a context for the node`);
  }

  const parent = await this.getOneById(parentId);

  if (!parent) {
    throw Error(`Parent does not exist`);
  }

  const path = buildPath(name, parent.path);

  const newNode = await Node.create({
    parent: parentId,
    name,
    context,
    path,
    attributes,
  });

  parent.children.push(newNode._id);
  await parent.save();

  return newNode;
};

/**
 *
 * @param {MongoDBId} nodeId
 * @returns
 */
exports.removeNode = async (nodeId) => {
  if (!nodeId) {
    throw Error("NodeID parameter is required");
  }

  if (!isValidObjectId(nodeId)) {
    throw Error("Invalid object id");
  }

  const node = await this.getOneById(nodeId);

  const subElements = await Node.find({ path: { $regex: node.path } });

  await Node.findByIdAndUpdate(node.parent, { $pull: { children: node._id } });

  await Node.deleteMany({ _id: subElements.map((el) => el._id) });
  return "Success";
};

/**
 *
 * @param {MongoDBId} first
 * @param {MongoDBId} second
 * @returns
 */
exports.swapNodes = async (first, second) => {
  const [firstNode, secondNode] = await Promise.all([
    this.getOneById(first),
    this.getOneById(second),
  ]);

  if (firstNode.parent.toString() !== secondNode.parent.toString()) {
    throw Error(`Must be within same parent !`);
  }

  const parentNode = await this.getOneById(firstNode.parent);

  const firstIndex = parentNode.children.findIndex(
    (child) => child._id.toString() === firstNode._id.toString()
  );

  const secondIndex = parentNode.children.findIndex(
    (child) => child._id.toString() === secondNode._id.toString()
  );

  const childrenIds = parentNode.children.map((child) => child._id.toString());

  const temp = childrenIds[firstIndex];
  childrenIds[firstIndex] = childrenIds[secondIndex];
  childrenIds[secondIndex] = temp;

  parentNode.children = childrenIds;

  await parentNode.save();
  return "Success";
};

/**
 *
 * @param {*} nodeId
 * @param {*} targetNodeId
 * @returns
 */
exports.moveNode = async (nodeId, targetNodeId) => {
  if (!isValidObjectId(nodeId)) {
    throw Error(`Node id is not a valid mongoose id`);
  }

  if (!isValidObjectId(targetNodeId)) {
    throw Error(`Target node is not a valid id`);
  }

  const nodeToMove = await this.getOneById(nodeId);

  if (!nodeToMove) {
    throw Error(`The node does not exist`);
  }

  const targetNode = await this.getOneById(targetNodeId);

  if (!targetNode) {
    throw Error(`Target node does not exist`);
  }

  await this.removeNodeFromChildrenArray(nodeToMove.parent, nodeToMove._id);

  await Node.findByIdAndUpdate(targetNode, {
    $push: { children: nodeToMove._id },
  });

  const subTree = await Node.find({ path: { $regex: nodeToMove.path } });

  for (const node of subTree) {
    // node.path = buildPath(targetNode.path, node.name);

    const restPath = node.path.replace(nodeToMove.path, "");

    const targetRootPath = targetNode.path;

    const newPath = targetRootPath + "/" + nodeToMove.name + restPath;

    node.path = newPath;

    await node.save();
  }

  nodeToMove.parent = targetNode._id;
  await nodeToMove.save();

  return "Success";
};

exports.updateNodeData = async (nodeId, data) => {
  const node = await Node.findById(nodeId);

  node.attributes = { ...node.attributes, ...data };
  await node.save();

  return node;
};

/**
 *
 * @param {string} nodeId
 * @param {string} newName
 * @returns {Promise} Returns the updated node
 */
exports.updateNodeName = async (nodeId, newName) => {
  // Find all nodes that include currentNode to update path;
  const currentNode = await Node.findById(nodeId);

  const nodesToUpdate = await Node.find({ path: { $regex: currentNode.path } });

  const currentNodeOldPath = currentNode.path;
  currentNode.path = currentNode.path.replace(currentNode.name, newName);

  for (const node of nodesToUpdate) {
    const newPath = node.path.replace(currentNodeOldPath, currentNode.path);
    node.path = newPath;
    await node.save();
  }

  currentNode.name = newName;
  await currentNode.save();
  return await Node.findById(nodeId);
};

exports.removeNodeFromChildrenArray = async (parentId, nodeId) => {
  await Node.findByIdAndUpdate(parentId, { $pull: { children: nodeId } });
};
