const UserService = require("../services/user.service");
const AuthService = require("../services/auth.service");

exports.signin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await AuthService.signin(email, password);

  if (!user) {
    return res.status(400).json({ message: "Bad credentials" });
  }

  req.session.user = user._id;

  res.status(200).json(user);
};

exports.signup = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await AuthService.signup(email, password);

  req.session.user = user._id;

  res.locales("user.created");
};

exports.signout = (req, res, next) => {
  req.session.destroy((err) => {
    res.sendStatus(204);
  });
};
