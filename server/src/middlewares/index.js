const locales = require("./locales");
const authenticate = require("./authenticate");
const { notFound } = require("./notFound");
const catchErrors = require("./catchErrors");
const { WrapController } = require("./utils");
const proxyHttp = require("./proxyHttp");
const { assetManager } = require("./assetManager");
const protectedRoute = require("./protectedRoute");
const { requireAuth } = require("./requireAuth");
const validateNode = require("./validateNode");

module.exports = {
  locales,
  authenticate,
  notFound,
  catchErrors,
  WrapController,
  proxyHttp,
  assetManager,
  protectedRoute,
  requireAuth,
  validateNode,
};
