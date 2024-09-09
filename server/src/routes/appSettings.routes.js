const router = require("express").Router();
const appSettingsController = require("../controllers/appSettings.controller");

router.get("/", appSettingsController.get);
router.patch("/", appSettingsController.update);

module.exports = router;
