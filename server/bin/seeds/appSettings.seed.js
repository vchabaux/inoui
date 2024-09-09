require("dotenv-flow").config();
const AppSettings = require("../../src/models/App");
const { initDB } = require("../../src/config");
const { appSettings } = require("../data/appSettings");

const seedAppSettings = async (project) => {
  try {
    await initDB();

    await AppSettings.collection
      .drop()
      .catch((err) => console.log("nothing to drop"));

    const data = appSettings[project];
    console.log(data);

    console.log(appSettings[project]);
    const created = await AppSettings.create(data);

    console.log(created);
  } catch (err) {
    console.error(err);
    process.exit();
  }
};
if (!process.argv[2]) {
  throw Error(`
  You must pass appName as first argument to npm run seed:app
  eg: => npm run seed:app cnrs1
  `);
}

const appName = process.argv[2].toUpperCase();

seedAppSettings(appName);
