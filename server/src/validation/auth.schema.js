const yup = require("yup");

const auth = {
  signin: yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().email().required(),
  }),
  signup: yup.object().shape({
    email: yup.string().email().require(),
    password: yup.string().min(8).required(),
  }),
};

module.exports = { auth };
