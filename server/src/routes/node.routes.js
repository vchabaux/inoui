const nodeController = require("../controllers/node.controller");
const router = require("express").Router();
const {
  authenticate,
  WrapController,
  validateNode,
} = require("../middlewares");

const WrappedController = WrapController(nodeController);

router.get("/", WrappedController.list);

router.get("/:id", WrappedController.findOne);

router.post(
  "/",
  authenticate,
  validateNode(["Parcours", "Point"]),
  WrappedController.create
);

router.patch(
  "/:id",
  authenticate,
  validateNode(["Parcours", "Point"]),
  WrappedController.update
);

router.patch(
  "/:id/attributes",
  authenticate,
  validateNode(["Parcours", "Point"]),
  WrappedController.updateAttr
);

router.patch(
  "/:id/name",
  authenticate,
  validateNode(["Parcours", "Point"]),
  WrappedController.updateName
);

router.patch(
  "/:id/path",
  authenticate,
  validateNode(["Parcours", "Point"]),
  WrappedController.moveNode
);

router.patch(
  "/:first/:second/position",
  authenticate,
  validateNode(["Parcours", "Point"]),
  WrappedController.swapNode
);

router.delete(
  "/:id",
  authenticate,
  validateNode(["Parcours"]),
  WrappedController.deleteOne
);

module.exports = router;
