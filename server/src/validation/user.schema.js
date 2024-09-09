const yup = require("yup");

const user = {
  create: yup.object().shape({
    email: yup.string().email().required(),
  }),
  update: yup.object().shape({
    role: yup.string(),
  }),
};

module.exports = { user };
