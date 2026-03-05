#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const allowlistPath = resolve(__dirname, "protected-files.allowlist");

function readAllowlist(filePath) {
  const raw = readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function gitNameStatus(args) {
  const output = execSync(`git diff --name-status ${args}`, {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split(/\s+/);
      return { status, path: rest[rest.length - 1] };
    });
}

function collectDeletedPaths() {
  const staged = gitNameStatus("--cached");
  const unstaged = gitNameStatus("");
  return [...staged, ...unstaged]
    .filter((entry) => entry.status.startsWith("D"))
    .map((entry) => entry.path);
}

function main() {
  const protectedFiles = readAllowlist(allowlistPath);
  const missingFiles = protectedFiles.filter(
    (relativePath) => !existsSync(resolve(repoRoot, relativePath)),
  );

  const deletedPaths = new Set(collectDeletedPaths());
  const deletedProtected = protectedFiles.filter((file) =>
    deletedPaths.has(file),
  );

  if (missingFiles.length || deletedProtected.length) {
    console.error("Protected-files check failed.");
    if (missingFiles.length) {
      console.error("\nMissing files:");
      for (const file of missingFiles) {
        console.error(`- ${file}`);
      }
    }
    if (deletedProtected.length) {
      console.error("\nDeleted in git diff:");
      for (const file of deletedProtected) {
        console.error(`- ${file}`);
      }
    }
    process.exit(1);
  }

  console.log(
    `Protected-files check passed (${protectedFiles.length} files protected).`,
  );
}

main();
