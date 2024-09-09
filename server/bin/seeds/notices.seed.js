require("dotenv-flow").config();
const { notices } = require("../data/notices");
const NoticeModel = require("../../src/models/Notice");
const UserModel = require("../../src/models/User");
const { initDB } = require("../../src/config");

const seedNotices = async () => {
  try {
    await initDB();

    await NoticeModel.collection.drop().catch((err) => {});

    const users = await UserModel.find();

    notices.forEach((notice) => {
      for (const update of notice.updates) {
        const foundUser = users.find((u) => u.email === update.author);
        update.author = foundUser._id;
      }

      const author = users.find((u) => u.email === notice.author);
      notice.author = author._id;
    });

    const createdNotices = await NoticeModel.create(notices);
    console.log(`Created ${createdNotices.length} notices`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

seedNotices();
