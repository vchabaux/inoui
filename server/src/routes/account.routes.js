const router = require("express").Router();
const accountController = require("../controllers/account.controller");
const { authenticate } = require("../middlewares");

router.post("/", accountController.createAccount);

/**
 * Password reset request.
 */
router.post("/password", accountController.requestChangePassword);

/**
 * Validate password change request
 */
router.patch("/password", accountController.changePassword);

router.get("/me", authenticate, accountController.getUser);
/**
 * Update user account infos -> name
 */
router.patch("/me", authenticate, accountController.updateAccount);

/**
 * Change password
 */
router.patch("/me/password", authenticate, accountController.updatePassword);

/**
 * Verify password
 */
router.post("/me/password", authenticate, accountController.verifyPassword);

/**
 * Update user email
 */
router.patch("/me/email", authenticate, accountController.changeEmail);

router.post("/me/email", authenticate, accountController.createMailToken);

router.get("/me/email/token", authenticate, accountController.mailToken);

router.post("/me/email/code", authenticate, accountController.validateCode);

module.exports = router;
