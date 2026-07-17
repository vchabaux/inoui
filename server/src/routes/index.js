const baseRouter = require("express").Router();
const { proxyHttp } = require("../middlewares");

const NAKALA_PROD_API_KEY = "11264a2b-1df9-46b5-af12-f6bdab7ef108";

const NAKALA_API_BASE = process.env.NAKALA_API_BASE || "https://api.nakala.fr";

const proxyConfig = {
  headers: { "X-API-KEY": process.env.NAKALA_API_KEY || NAKALA_PROD_API_KEY },
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

const nakalURL = NAKALA_API_BASE;

// Local temp-upload endpoint (must be mounted BEFORE the proxy so that
// POST /nakala/temp-upload is handled here instead of being forwarded).
baseRouter.use("/nakala", require("./nakalaTemp.routes"));

baseRouter.use("/nakala", proxyHttp(nakalURL, proxyConfig));

module.exports = baseRouter;
