const router = require("express").Router();
const pageController = require("../controllers/page.controller");
const {
  WrapController,
  protectedRoute,
  authenticate,
} = require("../middlewares");

/**
 * Automatically catch errors
 */
const WrappedController = WrapController(pageController);

router.get(
  "/",
  // protectedRoute(["super-admin", "editor", "admin"]),
  WrappedController.list
);

router.get("/:id", WrappedController.findOne);

router.patch("/:id", authenticate, WrappedController.updateOne);

module.exports = router;
