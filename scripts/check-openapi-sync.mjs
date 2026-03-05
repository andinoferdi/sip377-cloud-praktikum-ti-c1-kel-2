import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const source = resolve(repoRoot, "backend-gas", "openapi.yaml");
const target = resolve(repoRoot, "frontend", "public", "openapi.yaml");

const sourceText = readFileSync(source, "utf8");
const targetText = readFileSync(target, "utf8");

if (sourceText !== targetText) {
  console.error("OpenAPI spec is out of sync. Run: npm run docs:sync-openapi");
  process.exit(1);
}

console.log("OpenAPI spec is in sync.");
