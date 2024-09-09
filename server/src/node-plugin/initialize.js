const { nodePlugin } = require("./index");

// nodePlugin.addPlugin("Point", "before", "create", updateWalkingPath);

// nodePlugin.addPlugin("Point", "after", "create", updateWalkingPath);

// nodePlugin.addPlugin("Point", "before", "update", updateWalkingPath);

// nodePlugin.addPlugin("Point", "after", "update", updateWalkingPath);

nodePlugin.addPlugin("Parcours", "before", "create", getAuthor);

function getAuthor({ req, body }) {
  body.attributes.author = {
    ref: "User",
    value: req.user._id,
  };
}

function updateWalkingPath({ req, service, id, body }) {
  //   console.log("This is the body ===>", body);
  //   console.log(req, "this is req");
  //   console.log("I am here");
}
