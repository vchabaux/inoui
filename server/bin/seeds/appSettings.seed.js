require("dotenv-flow").config();
const AppSettings = require("../../src/models/App");
const { initDB } = require("../../src/config");
const { appSettings } = require("../data/appSettings");

const seedAppSettings = async (project) => {
  try {
    await initDB();

    const data = appSettings[project];
    if (!data) {
      console.error(`No settings found for project "${project}"`);
      process.exit(1);
    }

    const existing = await AppSettings.findOne({ project: project.toLowerCase() });

    if (!existing) {
      console.log("No existing settings found, creating new entry...");
      const created = await AppSettings.create(data);
      console.log("Created:", created);
    } else {
      console.log("Existing settings found, applying non-destructive upsert...");
      const update = {};
      // A flat/empty array is NOT falsy in JS, so an existing-but-empty
      // `licenses: []` would be skipped by a simple `!existing...licenses`.
      // Treat missing OR empty as "needs filling" so the seed is effective
      // even when the field was seeded empty on a previous run.
      const noLicenses =
        !existing.nakala ||
        !Array.isArray(existing.nakala.licenses) ||
        existing.nakala.licenses.length === 0;
      const noLanguage = !existing.nakala || !existing.nakala.language;
      const noAssetMetas =
        !existing.nakala ||
        !Array.isArray(existing.nakala.assetMetas) ||
        existing.nakala.assetMetas.length === 0;

      if (noLicenses) update["nakala.licenses"] = data.nakala.licenses;
      if (noLanguage) update["nakala.language"] = data.nakala.language;
      if (noAssetMetas) update["nakala.assetMetas"] = data.nakala.assetMetas;

      if (Object.keys(update).length) {
        await AppSettings.updateOne({ project: project.toLowerCase() }, { $set: update });
        console.log("Updated fields:", Object.keys(update));
      } else {
        console.log("All target fields already exist — nothing to update.");
      }
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
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
