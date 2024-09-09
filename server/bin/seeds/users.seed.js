require("dotenv-flow").config();

const { users } = require("../data/users");
const UserModel = require("../../src/models/User");
const { initDB } = require("../../src/config");

const seedUsers = async () => {
  try {
    await initDB();

    await UserModel.collection.drop().catch((err) => {});

    const createdUsers = await UserModel.create(users);
    console.log(`Created ${createdUsers.length} users`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

seedUsers();
