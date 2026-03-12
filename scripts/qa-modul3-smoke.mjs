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
    redirect: "follow",
  });
  return response.json();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

async function run() {
  const now = new Date();
  const deviceId = `qa-gps-${now.getTime()}`;
  const checks = {};
  let passed = 0;
  let failed = 0;

  function pass(label) {
    console.log(`  ✓ ${label}`);
    passed++;
  }

  function fail(label, err) {
    console.error(`  ✗ ${label}: ${err.message}`);
    failed++;
  }

  console.log("\n=== Modul 3 GPS Smoke Test ===");
  console.log(`device_id : ${deviceId}`);
  console.log(`base_url  : ${baseUrl}\n`);

  // ── 1. POST /telemetry/gps ────────────────────────────────────────────────
  console.log("[ 1 ] POST /telemetry/gps");
  let logResponse;
  try {
    logResponse = await requestJson("telemetry/gps", {
      method: "POST",
      body: {
        device_id: deviceId,
        ts: now.toISOString(),
        lat: -7.2575,
        lng: 112.7521,
        accuracy_m: 12.5,
        altitude_m: 30.0,
      },
    });
    assert(logResponse.ok === true, "response.ok must be true");
    assert(logResponse.data?.accepted === true, "accepted must be true");
    checks.log = logResponse.data;
    pass("ok=true, accepted=true");
  } catch (err) {
    fail("POST telemetry/gps", err);
    checks.log = logResponse ?? null;
  }

  // ── 2. POST second point (untuk polyline) ─────────────────────────────────
  console.log("[ 2 ] POST /telemetry/gps (titik ke-2)");
  try {
    const r2 = await requestJson("telemetry/gps", {
      method: "POST",
      body: {
        device_id: deviceId,
        ts: new Date(now.getTime() + 5000).toISOString(),
        lat: -7.2580,
        lng: 112.7528,
        accuracy_m: 10.0,
      },
    });
    assert(r2.ok === true, "response.ok must be true");
    assert(r2.data?.accepted === true, "accepted must be true");
    pass("titik ke-2 diterima");
  } catch (err) {
    fail("POST telemetry/gps titik ke-2", err);
  }

  // ── 3. GET /telemetry/gps/latest ─────────────────────────────────────────
  console.log("[ 3 ] GET /telemetry/gps/latest");
  let latestResponse;
  try {
    latestResponse = await requestJson("telemetry/gps/latest", {
      query: { device_id: deviceId },
    });
    assert(latestResponse.ok === true, "response.ok must be true");
    assert(latestResponse.data?.ts, "latest ts must exist");
    assert(
      typeof latestResponse.data?.lat === "number",
      "latest lat must be numeric",
    );
    assert(
      typeof latestResponse.data?.lng === "number",
      "latest lng must be numeric",
    );
    checks.latest = latestResponse.data;
    pass(`ok=true, lat=${latestResponse.data.lat}, lng=${latestResponse.data.lng}`);
  } catch (err) {
    fail("GET telemetry/gps/latest", err);
    checks.latest = latestResponse ?? null;
  }

  // ── 4. GET /telemetry/gps/history ────────────────────────────────────────
  console.log("[ 4 ] GET /telemetry/gps/history");
  let historyResponse;
  try {
    const historyFrom = new Date(now.getTime() - 60_000).toISOString();
    const historyTo = new Date(now.getTime() + 60_000).toISOString();
    historyResponse = await requestJson("telemetry/gps/history", {
      query: {
        device_id: deviceId,
        limit: 200,
        from: historyFrom,
        to: historyTo,
      },
    });
    assert(historyResponse.ok === true, "response.ok must be true");
    assert(
      Array.isArray(historyResponse.data?.items),
      "history items must be array",
    );
    assert(
      historyResponse.data.items.length >= 2,
      `expected >=2 items, got ${historyResponse.data.items.length}`,
    );

    const first = historyResponse.data.items[0];
    assert(first?.ts, "item ts must exist");
    assert(typeof first?.lat === "number", "item lat must be numeric");
    assert(typeof first?.lng === "number", "item lng must be numeric");

    // Verifikasi urut naik berdasarkan ts
    const timestamps = historyResponse.data.items.map((p) =>
      new Date(p.ts).getTime(),
    );
    const isAscending = timestamps.every(
      (t, i) => i === 0 || t >= timestamps[i - 1],
    );
    assert(isAscending, "items must be sorted ascending by ts");

    checks.history = {
      total: historyResponse.data.items.length,
      first: historyResponse.data.items[0],
      last: historyResponse.data.items[historyResponse.data.items.length - 1],
    };
    pass(
      `ok=true, ${historyResponse.data.items.length} items, urut asc ✓`,
    );
  } catch (err) {
    fail("GET telemetry/gps/history", err);
    checks.history = historyResponse ?? null;
  }

  // ── 5. GET /telemetry/gps/history dengan limit ───────────────────────────
  console.log("[ 5 ] GET /telemetry/gps/history?limit=1");
  try {
    const r = await requestJson("telemetry/gps/history", {
      query: {
        device_id: deviceId,
        limit: 1,
        from: new Date(now.getTime() - 60_000).toISOString(),
        to: new Date(now.getTime() + 60_000).toISOString(),
      },
    });
    assert(r.ok === true, "response.ok must be true");
    assert(Array.isArray(r.data?.items), "items must be array");
    assert(r.data.items.length === 1, `expected 1 item, got ${r.data.items.length}`);
    pass("limit=1 diterapkan dengan benar");
  } catch (err) {
    fail("GET telemetry/gps/history?limit=1", err);
  }

  // ── 6. Error: missing device_id ──────────────────────────────────────────
  console.log("[ 6 ] POST /telemetry/gps tanpa device_id (expect error)");
  try {
    const r = await requestJson("telemetry/gps", {
      method: "POST",
      body: { lat: -7.2575, lng: 112.7521, ts: now.toISOString() },
    });
    assert(r.ok === false, "missing device_id must return ok=false");
    checks.missing_device_error = r.error;
    pass(`ok=false, error="${r.error}"`);
  } catch (err) {
    fail("missing device_id validation", err);
  }

  // ── 7. Error: missing lat ────────────────────────────────────────────────
  console.log("[ 7 ] POST /telemetry/gps tanpa lat (expect error)");
  try {
    const r = await requestJson("telemetry/gps", {
      method: "POST",
      body: { device_id: deviceId, lng: 112.7521, ts: now.toISOString() },
    });
    assert(r.ok === false, "missing lat must return ok=false");
    checks.missing_lat_error = r.error;
    pass(`ok=false, error="${r.error}"`);
  } catch (err) {
    fail("missing lat validation", err);
  }

  // ── 8. GET latest device tidak ada ───────────────────────────────────────
  console.log("[ 8 ] GET /telemetry/gps/latest device tidak ada");
  try {
    const r = await requestJson("telemetry/gps/latest", {
      query: { device_id: "qa-unknown-device-xyz" },
    });
    assert(r.ok === true, "unknown device must still return ok=true (empty)");
    pass(`ok=true, lat=${r.data?.lat ?? "null"} (kosong)`);
  } catch (err) {
    fail("GET latest unknown device", err);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Passed : ${passed}`);
  console.log(`Failed : ${failed}`);
  console.log(`${"─".repeat(40)}\n`);

  if (failed > 0) {
    console.log(
      JSON.stringify(
        { ok: false, scenario: "modul3_gps_smoke", device_id: deviceId, checks },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      { ok: true, scenario: "modul3_gps_smoke", device_id: deviceId, checks },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
