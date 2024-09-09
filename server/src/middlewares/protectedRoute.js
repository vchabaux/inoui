const dayjs = require("dayjs");
const authenticate = require("./authenticate");

const { createError } = require("../utils");

const protectedRoute = (roles) => {
  return (req, res, next) => {
    const user = req.user;
    /**
     * Check if a user is in the session
     */
    if (!user) {
      return next(createError(401, "auth:not-connected"));
    }

    /**
     * Check for expiration
     */
    const expiresAt = user.expiresAt;

    if (expiresAt) {
      const today = dayjs();
      const userExpiration = dayjs(expiresAt);

      const duration = userExpiration.diff(today, "day");
      const isExpired = duration < 0;

      if (isExpired) {
        return next(createError(401, "auth::account-expired"));
      }
    }

    /**
     * User isnt allowed to access resource
     */
    const isAllowed = roles.includes(user.role);

    if (!isAllowed) {
      return next(createError(403, "auth::not-allowed"));
    }

    next();
  };
};

const wrapper = (roles) => {
  return [authenticate, protectedRoute(roles)];
};

module.exports = wrapper;
