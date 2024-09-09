const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { WrapController } = require("../middlewares");

const WrappedController = WrapController(authController);

router.post("/signin", WrappedController.signin);

router.post("/signup", WrappedController.signup);

router.post("/logout", authController.signout);

module.exports = router;
