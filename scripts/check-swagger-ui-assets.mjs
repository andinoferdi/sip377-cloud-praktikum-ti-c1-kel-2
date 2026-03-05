import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const targetDir = resolve(repoRoot, "frontend", "public", "docs");

const requiredFiles = [
  "index.html",
  "swagger-initializer.js",
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
  "swagger-ui.css",
  "favicon-16x16.png",
  "favicon-32x32.png",
];

const missingFiles = requiredFiles.filter(
  (fileName) => !existsSync(resolve(targetDir, fileName)),
);

if (missingFiles.length > 0) {
  console.error("Swagger UI assets are missing:");
  for (const fileName of missingFiles) {
    console.error(`- ${fileName}`);
  }
  console.error("Run: npm run docs:sync-swagger-ui-assets");
  process.exit(1);
}

console.log("Swagger UI static assets are in sync.");
