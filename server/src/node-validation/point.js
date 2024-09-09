const NodeService = require("../services/node.service");
const { createError } = require("../utils");

const validators = {
  //   DELETE: deleteValidator,
  PATCH: updateValidator,
  //   POST: createValidator,
};

const point = (req, res, next) => {
  if (req.query.type === "child") return next();
  const method = req.method;
  return validators[method](req, res, next);
};

async function updateValidator(req, res, next) {
  const rootPath = req.body.path.match(/\/(.*?)\//)[1];

  const foundNode = await NodeService.findByQuery({
    path: `/${rootPath}`,
  });

  const rootNode = foundNode[0];

  if (
    rootNode.attributes.status === "published" &&
    !req.body.attributes.notice.value
  ) {
    return next(createError(400, "track::publish-missing-notice"));
  }

  next();
}

module.exports = point;
