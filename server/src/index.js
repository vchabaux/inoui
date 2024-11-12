const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { locales } = require("./middlewares");
const config = require("./config");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { createError } = require("./utils");
const { initTransport } = require("./config/mail");
require("./node-plugin/initialize");
const { iconManagerServer } = require("@owlabio/icon-manager/server");
const { createProxyMiddleware } = require("http-proxy-middleware");


const app = express();

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(locales);

app.use(
  session({
    secret: config.session.secret,
    saveUninitialized: false,
    resave: true,
    cookie: {
      maxAge: 24 * 7 * 60 * 60 * 1000,
    },
    store: MongoStore.create({ mongoUrl: config.database.url }),
  })
);

app.use(
  cors({
    origin: config.app.allowedDomains,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(
  `/${config.app.uploadLocation}`,
  express.static(path.join(__dirname, "..", config.app.uploadLocation))
);

app.use("/static", express.static(path.join(__dirname, "..", "static")));

app.use(
  "/api2",
  createProxyMiddleware({
    target: "https://localhost:5000/api2", // Remplacez par l'adresse du deuxième serveur
    changeOrigin: true,
  })
);

app.use("/api", require("./routes"));

iconManagerServer.initRouters(app); // let's get awesome icons !

app.use("/api/*", (_, __, next) => {
  next(createError(404, "router::not-found"));
});

initTransport();

/**
 * Serve the build file
 */
app.use("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use((err, req, res, next) => {
  if (!res.headersSent) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something bad happened" });
  }
});

app.locals.name = config.app.name;

module.exports = app;
