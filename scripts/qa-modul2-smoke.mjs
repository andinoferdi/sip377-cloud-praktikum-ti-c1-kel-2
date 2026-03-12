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
        {
          t: new Date(now.getTime() - 800).toISOString(),
          x: 0.12,
          y: 0.01,
          z: 9.7,
        },
        {
          t: new Date(now.getTime() - 300).toISOString(),
          x: 0.16,
          y: 0.02,
          z: 9.68,
        },
      ],
    },
  });

  assert(postResponse.ok === true, "telemetry/accel must succeed.");
  assert(postResponse.data?.accepted === 2, "accepted must equal sample count.");

  const latestResponse = await requestJson("telemetry/accel/latest", {
    query: {
      device_id: deviceId,
    },
  });

  assert(latestResponse.ok === true, "telemetry/accel/latest must succeed.");
  assert(latestResponse.data?.t, "latest sample timestamp must exist.");
  assert(typeof latestResponse.data?.x === "number", "latest x must be numeric.");
  assert(typeof latestResponse.data?.y === "number", "latest y must be numeric.");
  assert(typeof latestResponse.data?.z === "number", "latest z must be numeric.");

  const historyFrom = new Date(now.getTime() - 60_000).toISOString();
  const historyTo = new Date(now.getTime() + 10_000).toISOString();
  const historyResponse = await requestJson("telemetry/accel/history", {
    query: {
      device_id: deviceId,
      limit: 1,
      from: historyFrom,
      to: historyTo,
    },
  });

  assert(historyResponse.ok === true, "telemetry/accel/history must succeed.");
  assert(Array.isArray(historyResponse.data?.items), "history items must be array.");
  assert(historyResponse.data.items.length === 1, "history limit must be applied.");
  assert(historyResponse.data.items[0]?.t, "history item timestamp must exist.");
  assert(typeof historyResponse.data.items[0]?.x === "number", "history x must be numeric.");
  assert(typeof historyResponse.data.items[0]?.y === "number", "history y must be numeric.");
  assert(typeof historyResponse.data.items[0]?.z === "number", "history z must be numeric.");

  const invalidResponse = await requestJson("telemetry/accel", {
    method: "POST",
    body: {
      device_id: "",
      samples: [{ t: batchTs, x: 0, y: 0, z: 0 }],
    },
  });

  assert(invalidResponse.ok === false, "missing device_id must fail.");

  console.log(
    JSON.stringify(
      {
        ok: true,
        scenario: "modul2_accel_smoke",
        device_id: deviceId,
        checks: {
          accepted: postResponse.data.accepted,
          latest: latestResponse.data,
          history: historyResponse.data,
          missing_device_error: invalidResponse.error,
        },
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
