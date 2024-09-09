const UserService = require("../services/user.service");

const authenticate = async (req, _, next) => {
  req.user = null;
  if (req.session.user) {
    req.user = await UserService.getAccount(req.session.user);
  }
  next();
};

module.exports = authenticate;
