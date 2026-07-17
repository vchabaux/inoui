// Helper: load .env then .env.development manually
// This avoids dotenv-flow issues on Windows (spaces-around-= format)
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
require("dotenv").config({ path: require("path").join(__dirname, "../../.env.development") });

// Start the seed
require("./appSettings.seed.js");
