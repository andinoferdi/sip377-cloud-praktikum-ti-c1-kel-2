import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const source = resolve(repoRoot, "backend-gas", "openapi.yaml");
const targetDir = resolve(repoRoot, "frontend", "public");
const target = resolve(targetDir, "openapi.yaml");

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);

console.log(`Synced OpenAPI spec to ${target}`);
