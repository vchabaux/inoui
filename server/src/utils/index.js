const slugify = require("slugify");
const fs = require("fs");
const hbs = require("handlebars");
const jwt = require("jsonwebtoken");
const App = require("../models/App");
const errors = require("../locales/errors/en.json");

/**
 * @param {string} envName
 * @param {boolean} required
 * @returns
 */

const parseEnv = (envName, required = true) => {
  const envValue = process.env[envName];

  if (required && !envValue)
    throw Error(`You forgot to define  "${envName}" var in your .env`);

  return envValue;
};

/**
 *
 * @param {string} name
 * @param {string} basePath
 * @returns {string} A folder-like structure with the base path and the new name
 */

const buildPath = (name, basePath = null, separator = "/") => {
  const slug = slugify(name, { lower: true });

  return basePath ? `${basePath}${separator}${slug}` : `${separator}${slug}`;
};

/**
 *
 * @param {string} path
 * @returns {Promise}
 */
const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

/**
 * Retrieves an HBS template located in src/templates and compiles it with the provided data
 * @param {string} filePath // Location, mus be in src/templates
 * @param {Object} data // Data you want to pass to the hbs view
 * @returns {Promise}
 */
const generateTemplate = async (filePath, data) => {
  try {
    const fileLocation = `src/templates/${filePath}.hbs`;
    const template = await readFile(fileLocation);
    const compiled = hbs.compile(template);

    return compiled(data);
  } catch (err) {
    throw err;
  }
};

/**
 *
 * @param {object} data Data to encrypt
 * @param {string} expiration JWT Expiration
 * @returns {string} JWT
 */
const generateToken = (data, expiration) => {
  return jwt.sign(data, parseEnv("APP_JWT_SECRET"), { expiresIn: expiration });
};

const verfiyToken = (token) => {
  return jwt.verify(token, parseEnv("APP_JWT_SECRET"));
};

/**
 * @param {string} location
 * @param {Buffer} buffer
 * @returns {Promise}
 */
const saveFile = (location, buffer) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(location, buffer, (err) => {
      if (err) reject(err);
      else resolve("Success");
    });
  });
};

const deleteFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) reject(err);
      else resolve(`File ${path} has been removed`);
    });
  });
};

const createError = (status, messageKey) => {
  const error = new Error(errors[messageKey]);
  error.status = status;
  return error;
};

/**
 * Capitalize the first letter of a string
 * @param {string} str
 *
 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Returns an object containing keys for each app public locale and empty strings as values
 * @param rule
 * @returns {Object}
 */
const localize = async (rule) => {
  const localized = {};

  await App.findOne().then((s) =>
    s.langs.public.map((l) => (localized[l] = rule))
  );

  return localized;
};

const getRandomInt = (max, min = 0) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateMailToken = () => {
  let token = "";

  for (let i = 0; i < 4; i++) {
    token += getRandomInt(9);
  }
  return token;
};

module.exports = {
  parseEnv,
  buildPath,
  readFile,
  generateTemplate,
  generateToken,
  generateMailToken,
  verfiyToken,
  saveFile,
  deleteFile,
  createError,
  capitalize,
  localize,
  getRandomInt,
};
