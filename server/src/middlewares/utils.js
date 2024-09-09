const catchErrors = require("./catchErrors");

const WrapController = (Controller) => {
  const wrapped = {};
  for (const key in Controller) {
    wrapped[key] = catchErrors(Controller[key]);
  }
  return wrapped;
};

module.exports = { WrapController };
