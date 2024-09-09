require("dotenv-flow").config();
const { tracks, points } = require("../data/tracks");
const Node = require("../../src/models/Node");
const NodeService = require("../../src/services/node.service");
const { initDB } = require("../../src/config");

const seedTrack = async () => {
  await initDB();
  try {
    await Node.collection.drop().catch((err) => console.log("Nothing to drop"));

    for (const track of tracks) {
      const root = await NodeService.createRoot(track);
      console.log(root, "this is root");
      const childToCreate = points.filter(
        (point) => point.parent === track.name
      );

      console.log(childToCreate);

      for (const child of childToCreate) {
        const parent = root._id;
        const createdChild = await NodeService.createNode(parent, child);
        console.log(createdChild);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

seedTrack();
