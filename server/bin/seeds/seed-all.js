/**
 * Master seed script — runs all seeds in dependency order.
 * Usage: node ./bin/seeds/seed-all.js [projectName]
 *   projectName: "cnrs1" (default) or "cnrs2"
 */
require("dotenv-flow").config();

const { execSync } = require("child_process");
const path = require("path");

const project = process.argv[2] || "cnrs1";
const seedsDir = path.resolve(__dirname);

const seeds = [
  { name: "users", file: "users.seed.js" },
  { name: "app settings", file: "appSettings.seed.js", args: [project] },
  { name: "notices", file: "notices.seed.js" },
  { name: "tracks", file: "tracks.seed.js" },
  { name: "pages", file: "pages.seed.js" },
  { name: "musicians", file: "musicians.seed.js" },
];

async function runAll() {
  console.log(`\n🚀 Initialisation de la base de données "inoui"\n`);
  console.log(`Projet : ${project}\n`);

  for (const seed of seeds) {
    console.log(`\n⏳ [${seed.name}]...`);
    try {
      const args = [path.join(seedsDir, seed.file)];
      if (seed.args) {
        args.push(...seed.args);
      }
      execSync(`node ${args.join(" ")}`, {
        cwd: path.resolve(__dirname, "../.."),
        stdio: "inherit",
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" },
      });
      console.log(`✅ [${seed.name}] OK`);
    } catch (err) {
      console.error(`❌ [${seed.name}] FAILED`);
      process.exit(1);
    }
  }

  console.log(`\n🎉 Base de données initialisée avec succès !`);
  console.log(`\nIdentifiants de test :`);
  console.log(`  Admin       : admin@test.com / admin123`);
  console.log(`  Superadmin  : jean@gmail.com / Foobarbaz123@`);
  console.log(`  Admin       : maria@gmail.com / Foobarbaz123@`);
  process.exit(0);
}

runAll();
