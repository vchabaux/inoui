require("dotenv-flow").config();

const User = require("../../src/models/User");
const Notice = require("../../src/models/Notice");
const { initDB } = require("../../src/config");
const NodeService = require("../../src/services/node.service");

async function updateTracks() {
  try {
    const email = process.argv[2];

    await initDB();

    const user = await User.findOne({ email: email });

    const tracks = await NodeService.getRoots("Parcours");

    for (const track of tracks) {
      track.attributes.author = {
        ref: "User",
        value: user._id,
      };

      await NodeService.updateData(track._id, track.attributes);
    }
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(1);
  }
}

updateTracks();
