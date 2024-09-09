const router = require("express").Router();
const assetController = require("../controllers/asset.controller");
const { requireAuth, assetManager, WrapController } = require("../middlewares");
const multer = require("multer");
const config = require("../config");

const uploader = multer({});
const WrappedController = WrapController(assetController);

router.get("/", requireAuth, WrappedController.list);

router.post(
  "/",
  requireAuth,
  uploader.array("files"),
  assetManager(config.app.uploadLocation, {}),
  WrappedController.create
);

router.patch("/:id", requireAuth, WrappedController.updateOne);

router.delete("/:id", WrappedController.removeOne);

module.exports = router;
