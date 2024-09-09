const router = require("express").Router();
const MusicianController = require("../controllers/musician.controller");
const { authenticate } = require("../middlewares");

router.get("/", MusicianController.list);
router.get("/:id", MusicianController.findOne);

router.post("/", authenticate, MusicianController.create);

router.patch("/:id", authenticate, MusicianController.updateOne);

router.delete("/:id", MusicianController.deleteOne);

module.exports = router;
