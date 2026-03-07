#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readBaseUrlFromDotEnv() {
  try {
    const dotEnvPath = resolve(process.cwd(), ".env");
    const raw = readFileSync(dotEnvPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(
        /^\s*NEXT_PUBLIC_GAS_BASE_URL\s*=\s*"?([^"\r\n]+)"?\s*$/,
      );
      if (match) {
        return match[1].trim();
      }
    }
  } catch {
    return "";
  }

  return "";
}

const baseUrl =
  process.env.NEXT_PUBLIC_GAS_BASE_URL || readBaseUrlFromDotEnv();

if (!baseUrl) {
  console.error("Missing NEXT_PUBLIC_GAS_BASE_URL.");
  process.exit(1);
}

function buildUrl(path, query = {}) {
  const url = new URL(baseUrl.replace(/\/+$/, ""));
  url.searchParams.set("path", path.replace(/^\/+/, ""));
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function requestJson(path, options = {}) {
  const { method = "GET", query, body } = options;
  const response = await fetch(buildUrl(path, query), {
    method,
    headers:
      method === "POST"
        ? { "Content-Type": "text/plain;charset=UTF-8" }
        : undefined,
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
  });
  return response.json();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const now = new Date();
  const deviceId = `qa-accel-${now.getTime()}`;
  const batchTs = now.toISOString();

  const postResponse = await requestJson("telemetry/accel", {
    method: "POST",
    body: {
      device_id: deviceId,
      ts: batchTs,
      samples: [
        { t: new Date(now.getTime() - 800).toISOString(), x: 0.12, y: 0.01, z: 9.7 },
        { t: new Date(now.getTime() - 300).toISOString(), x: 0.16, y: 0.02, z: 9.68 },
      ],
    },
  });

  assert(postResponse.ok === true, "telemetry/accel must succeed.");
  assert(
    postResponse.data?.accepted === 2,
    "telemetry/accel accepted count must equal submitted samples.",
  );

  const latestResponse = await requestJson("telemetry/accel/latest", {
    query: { device_id: deviceId },
  });

  assert(latestResponse.ok === true, "telemetry/accel/latest must succeed.");
  assert(typeof latestResponse.data?.t === "string", "latest.t must be string.");
  assert(
    latestResponse.data?.x === 0.16,
    "latest.x must match the newest sample for the device.",
  );
  assert(
    latestResponse.data?.y === 0.02,
    "latest.y must match the newest sample for the device.",
  );
  assert(
    latestResponse.data?.z === 9.68,
    "latest.z must match the newest sample for the device.",
  );

  const missingDeviceResponse = await requestJson("telemetry/accel/latest");
  assert(
    missingDeviceResponse.ok === false &&
      missingDeviceResponse.error === "missing_field: device_id",
    "telemetry/accel/latest without device_id must fail.",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        scenario: "modul2_accel_smoke",
        device_id: deviceId,
        checks: {
          accepted: postResponse.data.accepted,
          latest: latestResponse.data,
          missing_device_error: missingDeviceResponse.error,
        },
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        scenario: "modul2_accel_smoke",
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
