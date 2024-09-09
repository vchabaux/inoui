const bcrypt = require("bcrypt");
const config = require("../config");
const UserModel = require("../models/User");

exports.signup = async (email, password) => {
  const foundUser = await UserModel.findOne({ email });

  if (foundUser) throw Error(`user.exists`);

  const hashedPassword = await bcrypt.hash(password, config.auth.SALT);

  const newUser = {
    provider: "local",
    email,
    password: hashedPassword,
  };

  return UserModel.create(newUser);
};

exports.signin = async (email, password) => {
  const foundUser = await UserModel.findOne({ email });
  if (!foundUser) return null;
  else {
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (!isValidPassword) {
      return null;
    } else {
      return foundUser;
    }
  }
};
