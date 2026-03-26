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

function normalizeBaseUrl(value) {
  return String(value ?? "")
    .trim()
    .replace(/^NEXT_PUBLIC_GAS_BASE_URL=/i, "")
    .replace(/\/+$/, "");
}

const ownBaseUrl = normalizeBaseUrl(
  process.env.OWN_BASE_URL ||
    process.env.NEXT_PUBLIC_GAS_BASE_URL ||
    readBaseUrlFromDotEnv(),
);
const partnerBaseUrl = normalizeBaseUrl(process.env.PARTNER_BASE_URL);

if (!ownBaseUrl) {
  console.error("Missing OWN_BASE_URL / NEXT_PUBLIC_GAS_BASE_URL.");
  process.exit(1);
}

if (!partnerBaseUrl) {
  console.error("Missing PARTNER_BASE_URL.");
  console.error(
    "Hint: untuk simulasi awal, set PARTNER_BASE_URL sama dengan OWN_BASE_URL.",
  );
  process.exit(1);
}

function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(baseUrl);
  url.searchParams.set("path", path.replace(/^\/+/, ""));
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function requestJson(baseUrl, path, options = {}) {
  const { method = "GET", query, body } = options;
  const response = await fetch(buildUrl(baseUrl, path, query), {
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
    throw new Error(message);
  }
}

function createSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function runModul1(baseUrl, scenarioName) {
  const suffix = createSuffix();
  const courseId = `swap-${scenarioName}-${suffix}`.toLowerCase();
  const sessionId = `${courseId}-p01`;
  const ownerIdentifier = "198701012020011001";
  const checkinUserA = `qa-${suffix}-a`;
  const checkinUserB = `qa-${suffix}-b`;

  const generate = await requestJson(baseUrl, "presence/qr/generate", {
    method: "POST",
    body: {
      course_id: courseId,
      session_id: sessionId,
      meeting_no: 1,
      owner_identifier: ownerIdentifier,
      ts: new Date().toISOString(),
    },
  });
  assert(generate.ok === true, "modul1: generate QR gagal");
  const qrToken = generate.data?.qr_token;
  assert(typeof qrToken === "string" && qrToken.length > 0, "modul1: qr_token kosong");

  const checkin = await requestJson(baseUrl, "presence/checkin", {
    method: "POST",
    body: {
      user_id: checkinUserA,
      device_id: `dev-${suffix}`,
      course_id: courseId,
      session_id: sessionId,
      qr_token: qrToken,
      ts: new Date().toISOString(),
    },
  });
  assert(checkin.ok === true, "modul1: checkin pertama gagal");

  const status = await requestJson(baseUrl, "presence/status", {
    query: {
      user_id: checkinUserA,
      course_id: courseId,
      session_id: sessionId,
    },
  });
  assert(status.ok === true, "modul1: status gagal");
  assert(status.data?.status === "checked_in", "modul1: status bukan checked_in");

  const list = await requestJson(baseUrl, "presence/list", {
    query: {
      course_id: courseId,
      session_id: sessionId,
      limit: 20,
    },
  });
  assert(list.ok === true, "modul1: list gagal");
  assert(Array.isArray(list.data?.items), "modul1: list items bukan array");
  assert(list.data.items.length > 0, "modul1: list masih kosong");

  const stop = await requestJson(baseUrl, "presence/qr/stop", {
    method: "POST",
    body: {
      course_id: courseId,
      session_id: sessionId,
      ts: new Date().toISOString(),
    },
  });
  assert(stop.ok === true, "modul1: stop session gagal");

  const checkinAfterStop = await requestJson(baseUrl, "presence/checkin", {
    method: "POST",
    body: {
      user_id: checkinUserB,
      device_id: `dev-${suffix}-2`,
      course_id: courseId,
      session_id: sessionId,
      qr_token: qrToken,
      ts: new Date().toISOString(),
    },
  });
  assert(
    checkinAfterStop.ok === false && checkinAfterStop.error === "session_closed",
    "modul1: checkin setelah stop harus session_closed",
  );

  return {
    ok: true,
    course_id: courseId,
    session_id: sessionId,
    qr_token: qrToken,
    total_presence: list.data.items.length,
  };
}

async function runModul2(baseUrl, scenarioName) {
  const suffix = createSuffix();
  const now = Date.now();
  const deviceId = `swap-accel-${scenarioName}-${suffix}`;
  const batchTs = new Date(now).toISOString();

  const post = await requestJson(baseUrl, "telemetry/accel", {
    method: "POST",
    body: {
      device_id: deviceId,
      ts: batchTs,
      samples: [
        { t: new Date(now - 750).toISOString(), x: 0.12, y: 0.03, z: 9.7 },
        { t: new Date(now - 300).toISOString(), x: 0.22, y: 0.06, z: 9.6 },
      ],
    },
  });
  assert(post.ok === true, "modul2: POST telemetry/accel gagal");
  assert(post.data?.accepted === 2, "modul2: accepted tidak sesuai");

  const latest = await requestJson(baseUrl, "telemetry/accel/latest", {
    query: {
      device_id: deviceId,
    },
  });
  assert(latest.ok === true, "modul2: latest gagal");
  assert(typeof latest.data?.x === "number", "modul2: latest x tidak valid");

  const history = await requestJson(baseUrl, "telemetry/accel/history", {
    query: {
      device_id: deviceId,
      limit: 10,
      from: new Date(now - 60_000).toISOString(),
      to: new Date(now + 10_000).toISOString(),
    },
  });
  assert(history.ok === true, "modul2: history gagal");
  assert(Array.isArray(history.data?.items), "modul2: history items bukan array");
  assert(history.data.items.length > 0, "modul2: history kosong");

  return {
    ok: true,
    device_id: deviceId,
    accepted: post.data.accepted,
    latest: history.data.items[history.data.items.length - 1] ?? null,
    history_total: history.data.items.length,
  };
}

async function runModul3(baseUrl, scenarioName) {
  const suffix = createSuffix();
  const now = Date.now();
  const deviceId = `swap-gps-${scenarioName}-${suffix}`;

  const post1 = await requestJson(baseUrl, "telemetry/gps", {
    method: "POST",
    body: {
      device_id: deviceId,
      ts: new Date(now).toISOString(),
      lat: -7.2575,
      lng: 112.7521,
      accuracy_m: 12.5,
    },
  });
  assert(post1.ok === true, "modul3: POST gps pertama gagal");

  const post2 = await requestJson(baseUrl, "telemetry/gps", {
    method: "POST",
    body: {
      device_id: deviceId,
      ts: new Date(now + 5000).toISOString(),
      lat: -7.258,
      lng: 112.7528,
      accuracy_m: 11.2,
    },
  });
  assert(post2.ok === true, "modul3: POST gps kedua gagal");

  const latest = await requestJson(baseUrl, "telemetry/gps/latest", {
    query: {
      device_id: deviceId,
    },
  });
  assert(latest.ok === true, "modul3: latest gagal");
  assert(typeof latest.data?.lat === "number", "modul3: latest lat tidak valid");

  const history = await requestJson(baseUrl, "telemetry/gps/history", {
    query: {
      device_id: deviceId,
      limit: 200,
      from: new Date(now - 60_000).toISOString(),
      to: new Date(now + 60_000).toISOString(),
    },
  });
  assert(history.ok === true, "modul3: history gagal");
  assert(Array.isArray(history.data?.items), "modul3: history items bukan array");
  assert(history.data.items.length >= 2, "modul3: history kurang dari 2 titik");

  return {
    ok: true,
    device_id: deviceId,
    latest: latest.data,
    history_total: history.data.items.length,
  };
}

async function runScenario(name, targetBaseUrl) {
  const report = {
    scenario: name,
    target_base_url: targetBaseUrl,
    ok: true,
    modules: {
      modul1: null,
      modul2: null,
      modul3: null,
    },
  };

  try {
    report.modules.modul1 = await runModul1(targetBaseUrl, name);
  } catch (error) {
    report.ok = false;
    report.modules.modul1 = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    report.modules.modul2 = await runModul2(targetBaseUrl, name);
  } catch (error) {
    report.ok = false;
    report.modules.modul2 = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    report.modules.modul3 = await runModul3(targetBaseUrl, name);
  } catch (error) {
    report.ok = false;
    report.modules.modul3 = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return report;
}

async function run() {
  const startedAt = new Date().toISOString();

  const scenarioA = await runScenario(
    "A_c1_sender_to_c2_visualizer",
    partnerBaseUrl,
  );
  const scenarioB = await runScenario(
    "B_c2_sender_to_c1_visualizer",
    ownBaseUrl,
  );

  const result = {
    ok: scenarioA.ok && scenarioB.ok,
    started_at: startedAt,
    own_base_url: ownBaseUrl,
    partner_base_url: partnerBaseUrl,
    scenarios: [scenarioA, scenarioB],
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
