const { createError } = require("../utils");

const hasNoticesSet = (root) => {
  let isValid = true;

  const walk = (children) => {
    for (const child of children) {
      if (
        child.context === "Point" &&
        (!child.attributes.notice || child.attributes.notice.value === "")
      ) {
        isValid = false;
      }
      walk(child.children);
    }
  };

  walk(root.children);

  return isValid;
};

const validators = {
  DELETE: deleteValidator,
  PATCH: updateValidator,
  POST: createValidator,
};

const track = (req, res, next) => {
  if (req.query.type === "child") return next();
  const method = req.method;
  return validators[method](req, res, next);
};

function deleteValidator(req, res, next) {
  const user = req.user;

  const isAdmin = user.role === "admin" || user.role === "superadmin";

  if (!isAdmin) return createError(403, "track::unauthorized");

  next();
}

function updateValidator(req, res, next) {
  const data = req.body;
  const user = req.user;

  /**
   * Only admin roles can submit/change to published status
   */

  if (data.attributes.status === "published") {
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    if (!isAdmin) return next(createError(403, "track::unauthorized"));

    const isValid = hasNoticesSet(data);
    if (!isValid) {
      return next(createError(400, "track::notices-must-be-set"));
    }
  }
  /**
   * Any other roles can submit to review
   */
  if (data.attributes.status === "review") {
    const isValid = hasNoticesSet(data);
    if (!isValid) {
      return next(createError(400, "track::notices-must-be-set"));
    }
  }

  /**
   * If the attributes is draft, just submit the query
   */
  next();
}

function createValidator(req, res, next) {
  next();
}

// const trackValidators = {
//   create: (req, res, next) => {}, // POST
//   update: (req, res, next) => {}, // PATCH
//   updateAttr: (req, res, next) => {}, // PATCH
//   deleteOne: (req, res, next) => {}, // DELETE
// };

module.exports = track;
