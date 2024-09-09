const express = require("express");
const PlaylistController = require("../controllers/playlist.controller");
const { authenticate } = require("../middlewares");
const router = express.Router();

router.get("/", PlaylistController.list);
router.get("/:id", PlaylistController.findOne);

router.post("/", authenticate, PlaylistController.create);

router.patch("/:id", authenticate, PlaylistController.updateOne);

router.delete("/:id", PlaylistController.deleteOne);

module.exports = router;
