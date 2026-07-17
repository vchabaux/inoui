const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NAKALA_API_BASE || 'https://apitest.nakala.fr';
const API_KEY =
  process.env.NAKALA_API_KEY || 'aae99aba-476e-4ff2-2886-0aaf1bfa6fd2';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/inoui';

const AppModel = require(path.join(__dirname, 'src', 'models', 'App'));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Connect to MongoDB
  await mongoose.connect(MONGO_URL);
  console.log(`✓ Connected to MongoDB — ${mongoose.connection.name}`);

  // 2. POST a new collection on apitest.nakala.fr
  const body = {
    status: 'public',
    metas: [
      {
        value: 'inoui test collection',
        lang: 'fr',
        typeUri: 'http://www.w3.org/2001/XMLSchema#string',
        propertyUri: 'http://nakala.fr/terms#title',
      },
    ],
  };

  console.log(`\n── POST ${API_BASE}/collections ──`);
  const postRes = await axios.post(`${API_BASE}/collections`, body, {
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
  });
  console.log('Full response:', JSON.stringify(postRes.data, null, 2));

  // 3. Extract the new identifier
  const newId =
    postRes.data?.payload?.id ||
    postRes.data?.payload?.identifier ||
    postRes.data?.identifier;
  if (!newId) {
    throw new Error(
      `Could not extract identifier from Nakala response.\n` +
        `Keys present: ${Object.keys(postRes.data).join(', ')}`
    );
  }
  console.log(`\n✦ New collection ID: ${newId}`);

  // 4. Update the single App document in the local database
  const updated = await AppModel.findOneAndUpdate(
    {},
    { $set: { 'nakala.collection': newId } },
    { new: true },
  );
  console.log(`✓ DB updated — App.nakala.collection = ${updated.nakala.collection}`);

  // 5. Write local metadata file (NOT committed)
  const metaPath = path.join(__dirname, '.nakala-test.json');
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      { collectionId: newId, apiBase: API_BASE, createdAt: new Date().toISOString() },
      null,
      2,
    ) + '\n',
  );
  console.log(`✓ Metadata written → ${metaPath}`);

  // 6. Verify the collection exists on apitest
  console.log(`\n── GET ${API_BASE}/collections/${newId} ──`);
  const getRes = await axios.get(`${API_BASE}/collections/${newId}`, {
    headers: { 'X-API-KEY': API_KEY },
  });
  console.log(`Verification — HTTP ${getRes.status} — collection exists on apitest`);

  return newId;
}

// ── Run ───────────────────────────────────────────────────────────────────────
let newId;
main()
  .then((id) => {
    newId = id;
  })
  .catch((err) => {
    console.error(`\n✗ Error: ${err.message}`);
    if (err.response) {
      console.error(`  HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      console.error('  No response received (network error)');
    }
    process.exitCode = 1;
  })
  .finally(() => {
    mongoose.disconnect().catch(() => {});
    if (newId) {
      console.log(`\n✅ Done — Admin URL: https://apitest.nakala.fr/${newId}`);
    }
  });
