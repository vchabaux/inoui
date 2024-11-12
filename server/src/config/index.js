const { initDB } = require("./dbConnection");
const { cwd } = require("process");
const path = require("path");
const fs = require("fs");
const { parseEnv } = require("../utils");

const getLocales = (folderPath) => {
  return fs
    .readdirSync(cwd() + folderPath)
    .map((file) => path.parse(file).name)
    .reduce((acc, curr) => {
      acc[curr] = require(cwd() + folderPath + curr + ".json");

      return acc;
    }, {});
};

module.exports = {
  //APP
  app: {
    name: parseEnv("APP_NAME"),
    host: parseEnv("APP_HOST"),
    url: parseEnv("APP_URL"),
    port: parseEnv("APP_PORT", false),
    protocol: parseEnv("APP_PROTOCOL", false),
    allowedDomains:["https://vchabaux.github.io"],
    uploadLocation: "uploads",
    jwt_secret: parseEnv("APP_JWT_SECRET"),
  },

  mailing: {
    provider: "SMTP",
    HOST: parseEnv("APP_SMTP_HOST"),
    PORT: parseEnv("APP_SMTP_PORT"),
    SENDER: parseEnv("APP_EMAIL_SENDER"),
    PASSWORD: parseEnv("APP_EMAIL_PASSWORD", false),
  },

  swBucket: {
    access_id: parseEnv("SW_ACCESS_ID"),
    secret_key: parseEnv("SW_SECRET_KEY"),
  },

  // DATABASE
  initDB: () => initDB(parseEnv("MONGODB_URL")),

  database: {
    url: parseEnv("MONGODB_URL"),
    name: parseEnv("DB_NAME"),
  },

  session: {
    secret: parseEnv("SESSION_SECRET"),
  },

  // AUTH
  auth: {
    SALT: Number(parseEnv("SALT")),
  },
  // LOCALES
  locales: {
    responses: getLocales("/src/locales/responses/"),
    errors: getLocales("/src/locales/errors/"),
  },
};
