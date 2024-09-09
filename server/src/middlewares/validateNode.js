const nodeValidators = require("../node-validation");
const { capitalize, createError } = require("../utils");
const NodeService = require("../services/node.service");

/**
 * Middleware to validate specific nodes
 * Provide a list of contexts to validate.
 * If the provided context is not part of the list, it will skip the validation
 * and go to the next middleware
 *
 *  @TODO Maybe provide an action to pick specific validator ?
 *  Such as update / create / delete
 * @param {string} contexts
 */

const validateNode = (contexts) => {
  return async (req, res, next) => {
    /**
     * Maybe the context should always be provided ?
     */

    // if (!req.query.context) {
    //   return createError(400, "node::no-context-provided");
    // }

    /**
     * Methods with no context are :
     *  DELETE
     *  PATCH, skip ?
     */
    const method = req.method;
    let ctx;
    // Get context from patch or delete method
    if (method === "PATCH" || method === "DELETE") {
      if (!req.params.id) return next();
      const foundNode = await NodeService.getOneById(req.params.id);
      if (!foundNode) return next(); // Skip if the node doesn't exist -> error handled by the controller itself
      ctx = foundNode.context;
    }

    if (method === "POST") {
      ctx = req.query.context;
    }

    /**
     * If the context is not to be validated, proceed..
     */
    if (!contexts.includes(ctx)) return next();

    /**
     * Call the validator, must be of connect type
     */
    return nodeValidators[ctx.toLowerCase()](req, res, next);
  };
};

module.exports = validateNode;
