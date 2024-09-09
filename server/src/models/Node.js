const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nodeSchema = new Schema(
  {
    name: { type: String, required: true },

    parent: { type: Schema.Types.ObjectId, ref: "Node" },
    children: [{ type: Schema.Types.ObjectId, ref: "Node", default: null }],

    original: { type: Schema.Types.ObjectId, ref: "Node" },
    attributes: { type: Schema.Types.Mixed, default: {} },
    context: { type: String },

    path: { type: String, required: true },
  },
  { timestamps: true }
);

const populateFields = function (next) {
  const options = this.getOptions();

  // in order to avoid an infinite loop, pass { skipMiddleware: true }
  // in the findOne operations that happen inside the middleware
  const { skipMiddleware } = options;

  if (skipMiddleware) return next();

  this.populate(["children"]);
  next();
};

nodeSchema.pre("find", populateFields).pre("findOne", populateFields);

const Node = mongoose.model("Node", nodeSchema);

module.exports = Node;
