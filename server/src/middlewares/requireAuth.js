exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    const error = new Error("auth:not-logged-in");
    error.status = 401;
    next(error);
  } else {
    next();
  }
};
