require("dotenv-flow").config();
const { musicians } = require("../data/musicians");
const MusicianModel = require("../../src/models/Musician");
const UserModel = require("../../src/models/User");
const { initDB } = require("../../src/config");

const seedMusicians = async () => {
  try {
    await initDB();

    await MusicianModel.collection.drop().catch((err) => {});
    
    const createdMusicians = await MusicianModel.create(musicians);
    console.log(`Created ${createdMusicians.length} musicians`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

seedMusicians();
