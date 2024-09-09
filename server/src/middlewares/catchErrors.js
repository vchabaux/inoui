const catchErrors = (fn) => (req, res, next) => {
  return fn(req, res, next).catch((err) => {
    console.log("An error occured: ", err);
    next(err);
  });
};

module.exports = catchErrors;
