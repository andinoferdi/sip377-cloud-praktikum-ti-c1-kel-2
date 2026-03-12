import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const source = resolve(repoRoot, "backend-gas", "openapi.yaml");
const targetDir = resolve(repoRoot, "frontend", "public");
const targetModul1 = resolve(targetDir, "openapi-modul-1.json");
const targetModul2 = resolve(targetDir, "openapi-modul-2.json");
const args = new Set(process.argv.slice(2));
const checkMode = args.has("--check");

async function loadYamlParser() {
  const parserPath = resolve(
    repoRoot,
    "frontend",
    "node_modules",
    "js-yaml",
    "index.js",
  );
  if (!existsSync(parserPath)) {
    console.error("js-yaml is not installed. Run: npm install (in frontend)");
    process.exit(1);
  }
  const parserModule = await import(pathToFileURL(parserPath).href);
  return parserModule.load;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function keepEnumValues(schema, allowedValues) {
  if (!schema?.enum || !Array.isArray(schema.enum)) {
    return false;
  }
  schema.enum = schema.enum.filter((value) => allowedValues.has(value));
  return schema.enum.length > 0;
}

function filterExamples(content, allowedExampleKeys) {
  if (!content || typeof content !== "object") {
    return;
  }
  for (const mediaType of Object.values(content)) {
    if (!mediaType || typeof mediaType !== "object") {
      continue;
    }
    if (!mediaType.examples || typeof mediaType.examples !== "object") {
      continue;
    }
    const nextExamples = {};
    for (const [exampleKey, exampleValue] of Object.entries(mediaType.examples)) {
      if (allowedExampleKeys.has(exampleKey)) {
        nextExamples[exampleKey] = exampleValue;
      }
    }
    if (Object.keys(nextExamples).length > 0) {
      mediaType.examples = nextExamples;
    } else {
      delete mediaType.examples;
    }
  }
}

function filterSingleExample(content, allowedErrorCodes) {
  if (!content || typeof content !== "object") {
    return;
  }
  for (const mediaType of Object.values(content)) {
    if (!mediaType || typeof mediaType !== "object") {
      continue;
    }
    if (!Object.hasOwn(mediaType, "example")) {
      continue;
    }
    if (allowedErrorCodes === null) {
      continue;
    }
    const errorCode = mediaType.example?.error;
    if (
      typeof errorCode !== "string" ||
      !allowedErrorCodes.has(errorCode)
    ) {
      delete mediaType.example;
    }
  }
}

function filterOneOfSchema(requestBody, allowedRefs) {
  const schema = requestBody?.content?.["application/json"]?.schema;
  if (!schema || !Array.isArray(schema.oneOf)) {
    return;
  }
  schema.oneOf = schema.oneOf.filter((item) => allowedRefs.has(item?.$ref));
}

function collectSchemaRefs(node, refs) {
  if (!node || typeof node !== "object") {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectSchemaRefs(item, refs);
    }
    return;
  }
  const ref = node.$ref;
  if (typeof ref === "string" && ref.startsWith("#/components/schemas/")) {
    refs.add(ref.replace("#/components/schemas/", ""));
  }
  for (const value of Object.values(node)) {
    collectSchemaRefs(value, refs);
  }
}

function pruneComponentsSchemas(spec) {
  const schemas = spec.components?.schemas;
  if (!schemas || typeof schemas !== "object") {
    return;
  }

  const refs = new Set();
  collectSchemaRefs(spec.paths, refs);

  const queue = [...refs];
  while (queue.length > 0) {
    const schemaName = queue.pop();
    const schema = schemas[schemaName];
    if (!schema) {
      continue;
    }
    const nestedRefs = new Set();
    collectSchemaRefs(schema, nestedRefs);
    for (const nestedName of nestedRefs) {
      if (!refs.has(nestedName)) {
        refs.add(nestedName);
        queue.push(nestedName);
      }
    }
  }

  const nextSchemas = {};
  for (const schemaName of refs) {
    if (schemas[schemaName]) {
      nextSchemas[schemaName] = schemas[schemaName];
    }
  }

  if (Object.keys(nextSchemas).length > 0) {
    spec.components.schemas = nextSchemas;
  } else if (spec.components) {
    delete spec.components.schemas;
    if (Object.keys(spec.components).length === 0) {
      delete spec.components;
    }
  }
}

function buildModuleSpec(baseSpec, moduleConfig) {
  const spec = clone(baseSpec);
  spec.info = {
    ...spec.info,
    title: `${baseSpec.info?.title ?? "API"} - ${moduleConfig.moduleTitle}`,
    description: moduleConfig.moduleDescription,
  };

  const execPath = spec.paths?.["/exec"];
  if (!execPath) {
    throw new Error("OpenAPI source must contain /exec path.");
  }

  const getOp = execPath.get;
  if (getOp) {
    const pathParameter = (getOp.parameters ?? []).find(
      (parameter) => parameter?.name === "path" && parameter?.in === "query",
    );
    if (!keepEnumValues(pathParameter?.schema, moduleConfig.getPathEnums)) {
      delete execPath.get;
    } else {
      getOp.parameters = (getOp.parameters ?? []).filter((parameter) =>
        moduleConfig.getParameters.has(parameter?.name),
      );
      filterExamples(
        getOp.responses?.["200"]?.content,
        moduleConfig.getSuccessExamples,
      );
      filterExamples(
        getOp.responses?.["400"]?.content,
        moduleConfig.getErrorExamples,
      );
      filterSingleExample(
        getOp.responses?.["400"]?.content,
        moduleConfig.getErrorCodes,
      );
    }
  }

  const postOp = execPath.post;
  if (postOp) {
    const pathParameter = (postOp.parameters ?? []).find(
      (parameter) => parameter?.name === "path" && parameter?.in === "query",
    );
    if (!keepEnumValues(pathParameter?.schema, moduleConfig.postPathEnums)) {
      delete execPath.post;
    } else {
      postOp.parameters = (postOp.parameters ?? []).filter((parameter) =>
        moduleConfig.postParameters.has(parameter?.name),
      );
      filterOneOfSchema(postOp.requestBody, moduleConfig.postRequestRefs);
      filterExamples(
        postOp.responses?.["200"]?.content,
        moduleConfig.postSuccessExamples,
      );
      filterExamples(
        postOp.responses?.["400"]?.content,
        moduleConfig.postErrorExamples,
      );
      filterSingleExample(
        postOp.responses?.["400"]?.content,
        moduleConfig.postErrorCodes,
      );
    }
  }

  if (!execPath.get && !execPath.post) {
    delete spec.paths["/exec"];
  }

  pruneComponentsSchemas(spec);
  return spec;
}

function writeOrCheck(filePath, nextContent) {
  const currentContent = existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
  if (checkMode) {
    if (currentContent !== nextContent) {
      console.error(
        `OpenAPI module artifact is out of sync: ${filePath}. Run: npm run docs:sync-openapi-modules`,
      );
      return false;
    }
    return true;
  }

  writeFileSync(filePath, nextContent, "utf8");
  return true;
}

async function main() {
  const yamlLoad = await loadYamlParser();
  const sourceText = readFileSync(source, "utf8");
  const sourceSpec = yamlLoad(sourceText);

  const modul1Spec = buildModuleSpec(sourceSpec, {
    moduleTitle: "Modul 1 - Presensi QR",
    moduleDescription: "Dokumentasi endpoint untuk Modul 1 - Presensi QR.",
    getPathEnums: new Set([
      "presence/status",
      "presence/list",
      "presence/sessions/active",
      "presence/course/config",
    ]),
    postPathEnums: new Set([
      "presence/qr/generate",
      "presence/checkin",
      "presence/qr/stop",
      "presence/course/config",
    ]),
    getParameters: new Set([
      "path",
      "user_id",
      "owner_identifier",
      "course_id",
      "session_id",
      "limit",
      "include_stopped",
    ]),
    postParameters: new Set(["path"]),
    postRequestRefs: new Set([
      "#/components/schemas/GenerateQRRequest",
      "#/components/schemas/CheckinRequest",
      "#/components/schemas/StopSessionRequest",
      "#/components/schemas/CourseMeetingConfigUpdateRequest",
    ]),
    getSuccessExamples: new Set([
      "presenceStatus",
      "presenceList",
      "activeSessions",
      "courseConfig",
    ]),
    getErrorExamples: new Set(),
    getErrorCodes: new Set(["missing_field: device_id", "token_invalid"]),
    postSuccessExamples: new Set([
      "generateQR",
      "checkinSuccess",
      "checkinError",
      "stopSession",
      "courseConfigUpdate",
    ]),
    postErrorExamples: new Set(),
    postErrorCodes: new Set(["token_invalid"]),
  });

  const modul2Spec = buildModuleSpec(sourceSpec, {
    moduleTitle: "Modul 2 - Accelerometer",
    moduleDescription: "Dokumentasi endpoint untuk Modul 2 - Accelerometer.",
    getPathEnums: new Set(["telemetry/accel/latest", "telemetry/accel/history"]),
    postPathEnums: new Set(["telemetry/accel"]),
    getParameters: new Set(["path", "device_id", "limit", "from", "to"]),
    postParameters: new Set(["path"]),
    postRequestRefs: new Set(["#/components/schemas/BatchAccelRequest"]),
    getSuccessExamples: new Set(["accelLatest", "accelHistory"]),
    getErrorExamples: new Set(),
    getErrorCodes: new Set(["missing_field: device_id"]),
    postSuccessExamples: new Set(["accelBatch"]),
    postErrorExamples: new Set(),
    postErrorCodes: new Set(),
  });

  const modul1Content = `${JSON.stringify(modul1Spec, null, 2)}\n`;
  const modul2Content = `${JSON.stringify(modul2Spec, null, 2)}\n`;

  mkdirSync(targetDir, { recursive: true });

  const modul1Ok = writeOrCheck(targetModul1, modul1Content);
  const modul2Ok = writeOrCheck(targetModul2, modul2Content);

  if (!modul1Ok || !modul2Ok) {
    process.exit(1);
  }

  if (checkMode) {
    console.log("OpenAPI module artifacts are in sync.");
  } else {
    console.log(`Synced module OpenAPI artifacts to ${targetDir}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
