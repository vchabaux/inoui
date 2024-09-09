const yup = require("yup");

const create = yup.object().shape({
  hasVisiblePath: yup.boolean().required(),
  color: yup.string(),
  attributes: yup.object(),
});

const update = yup.object().shape({
  hasVisiblePath: yup.boolean(),
  color: yup.string(),
  attributes: yup.object(),
});

module.exports = {
  create,
  update,
};
