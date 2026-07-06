// require("dotenv/config");
require("dotenv-flow").config();
const app = require("./src");
const { initDB } = require("./src/config");
const config = require("./src/config");
require("handlebars");
// const backupCRON = require("@owlabio/backup-cron"); // TODO Phase 4bis: réécrire la logique de backup
const path = require("path");

console.log(path.join(__dirname, "uploads"));

const start = async () => {
  try {
    await initDB();

    app.listen(config.app.port, () => {
      console.log(
        `Listening on ${config.app.protocol}://${config.app.host}:${config.app.port}`
      );
    });

    // TODO Phase 4bis: réécrire la logique de backup
    // backupCRON({
    //   dbName: config.database.name,
    //   fileLocation: "db_dump",
    //   appName: config.app.name,
    //   occurence: "daily",
    //   test: false,
    //   bucket: {
    //     sw_accessId: config.swBucket.access_id,
    //     sw_secretKey: config.swBucket.secret_key,
    //     bucketName: "ryzom-dev",
    //     region: "fr-par",
    //     endpoint: "s3.scw.cloud",
    //     folderName: config.app.name,
    //     prefix: "mongodump_",
    //   },
    //   folders: [],
    // });

  } catch (err) {
    console.log("Failed to connect to Database...", err);
    process.exit();
  }
};

start();
