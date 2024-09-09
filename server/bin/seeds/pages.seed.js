require("dotenv-flow").config();
const { pages } = require("../data/pages");
const PageModel = require("../../src/models/Page");
const UserModel = require("../../src/models/User");
const { initDB } = require("../../src/config");

const seedPages = async () => {
  try {
    await initDB();

    await PageModel.collection.drop().catch((err) => {});

    const createdPages = await PageModel.create(pages);
    console.log(`Created ${createdPages.length} pages`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

seedPages();
