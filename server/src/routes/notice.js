const router = require("express").Router();
const noticeController = require("../controllers/notice.controller");
const {
  WrapController,
  protectedRoute,
  authenticate,
} = require("../middlewares");

/**
 * Automatically catch errors
 */
const WrappedController = WrapController(noticeController);

router.get(
  "/",
  // protectedRoute(["super-admin", "editor", "admin"]),
  WrappedController.list
);

router.get("/:id", WrappedController.findOne);

router.post(
  "/:id",
  protectedRoute(["super-admin", "admin", "editor"]),
  authenticate,
  WrappedController.create
);

router.post("/", authenticate, WrappedController.create);

router.patch("/:id", authenticate, WrappedController.updateOne);

router.delete("/:id", authenticate, WrappedController.deleteOne);

module.exports = router;
