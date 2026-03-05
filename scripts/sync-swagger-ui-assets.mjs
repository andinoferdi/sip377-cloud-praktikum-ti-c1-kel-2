import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const distDir = resolve(repoRoot, "frontend", "node_modules", "swagger-ui-dist");
const targetDir = resolve(repoRoot, "frontend", "public", "docs");

if (!existsSync(distDir)) {
  console.error("swagger-ui-dist is not installed. Run: npm install (in frontend)");
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

const filesToCopy = [
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
  "swagger-ui.css",
  "favicon-16x16.png",
  "favicon-32x32.png",
];

for (const fileName of filesToCopy) {
  copyFileSync(resolve(distDir, fileName), resolve(targetDir, fileName));
}

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Docs | CloudTrack Campus</title>
    <link rel="icon" type="image/png" href="/docs/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="/docs/favicon-16x16.png" sizes="16x16" />
    <link rel="stylesheet" href="/docs/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow-y: scroll; }
      *, *:before, *:after { box-sizing: inherit; }
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js"></script>
    <script src="/docs/swagger-ui-standalone-preset.js"></script>
    <script src="/docs/swagger-initializer.js"></script>
  </body>
</html>
`;

const initializerJs = `window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/openapi.yaml",
    dom_id: "#swagger-ui",
    deepLinking: true,
    docExpansion: "list",
    displayRequestDuration: true,
    persistAuthorization: false,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "BaseLayout",
  });
};
`;

writeFileSync(resolve(targetDir, "index.html"), indexHtml, "utf8");
writeFileSync(resolve(targetDir, "swagger-initializer.js"), initializerJs, "utf8");

console.log(`Synced Swagger UI static assets to ${targetDir}`);
