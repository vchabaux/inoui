const router = require("express").Router();
const UserController = require("../../controllers/admin/user.controller");
const {
  WrapController,
  authenticate,
  accessControl,
} = require("../../middlewares");
const AccountController = require("../../controllers/account.controller");

const WrappedController = WrapController(UserController);
const WrappedAccountController = WrapController(AccountController);

router.get("/", WrappedController.list);

router.get("/:id", WrappedController.getOne);

router.post("/", WrappedAccountController.createAccount);

router.patch("/:id", WrappedController.updateOne);

router.delete("/:id", WrappedController.deleteOne);

module.exports = router;
