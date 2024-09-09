const errorHandler = (err, req, res, next) => {
  // TODO Use locales for server error
  res.status(err.status || 500).json({ message: "Server error" });
};

module.exports = errorHandler;
