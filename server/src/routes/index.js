const baseRouter = require("express").Router();
const { proxyHttp } = require("../middlewares");

const proxyConfig = {
  headers: { "X-API-KEY": "11264a2b-1df9-46b5-af12-f6bdab7ef108" }, // prod
  // headers: { "X-API-KEY": "01234567-89ab-cdef-0123-456789abcdef" }, // dev
};

baseRouter.use("/auth", require("./auth.routes"));
baseRouter.use("/account", require("./account.routes"));
baseRouter.use("/admin/users", require("./admin/user.routes"));
baseRouter.use("/app-settings", require("./appSettings.routes"));

baseRouter.use("/nodes", require("./node.routes"));
baseRouter.use("/notices", require("./notice"));
baseRouter.use("/playlists", require("./playlist.routes"));
baseRouter.use("/pages", require("./pages.routes"));
baseRouter.use("/musicians", require("./musicians.routes"));
baseRouter.use("/assets", require("./asset.routes"));
baseRouter.use("/musicians", require("./musicians.routes"));

const nakalaURIS = {
  production: "https://api.nakala.fr",
  staging: "https://apitest.nakala.fr",
  development: "https://apitest.nakala.fr",
};

// const nakalURL =
// nakalaURIS[process.env.NODE_ENV] || "https://apitest.nakala.fr";

// const nakalURL = "https://apitest.nakala.fr";
const nakalURL = "https://api.nakala.fr";

baseRouter.use("/nakala", proxyHttp(nakalURL, proxyConfig));

module.exports = baseRouter;
