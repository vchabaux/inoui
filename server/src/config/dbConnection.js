const mongoose = require("mongoose");

const initDB = async (mongoURL) => {
  try {
    if (!mongoURL) throw Error(`Missing parameter mongoURL`);
    const self = await mongoose.connect(mongoURL);
    console.log(`Connected to ${self.connection.name}`);
  } catch (err) {
    throw err;
  }
};

module.exports = { initDB };
