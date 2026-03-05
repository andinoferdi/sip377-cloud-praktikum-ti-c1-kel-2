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
  const payload = await response.json();
  return payload;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertStringField(value, fieldName) {
  assert(typeof value === "string", `Field ${fieldName} must be string.`);
}

async function run() {
  const now = new Date();
  const sessionId = `qa-${now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;
  const courseId = "cloud-101";
  const ownerIdentifier = "198701012020011001";

  const generate = await requestJson("presence/qr/generate", {
    method: "POST",
    body: {
      course_id: courseId,
      session_id: sessionId,
      owner_identifier: ownerIdentifier,
      ts: now.toISOString(),
    },
  });
  assert(generate.ok === true, "generateQR must succeed.");
  assertStringField(generate.data.qr_token, "generate.data.qr_token");

  const qrToken = generate.data.qr_token;
  const primaryUser = "434231079";
  const secondUser = "434231065";

  const statusBefore = await requestJson("presence/status", {
    query: { user_id: primaryUser, course_id: courseId, session_id: sessionId },
  });
  assert(statusBefore.ok === true, "status before check-in must succeed.");
  assert(statusBefore.data.status === "not_checked_in", "status before must be not_checked_in.");

  const checkin1 = await requestJson("presence/checkin", {
    method: "POST",
    body: {
      user_id: primaryUser,
      device_id: "qa-dev-001",
      course_id: courseId,
      session_id: sessionId,
      qr_token: qrToken,
      ts: new Date().toISOString(),
    },
  });
  assert(checkin1.ok === true, "first checkin must succeed.");
  assertStringField(checkin1.data.presence_id, "checkin1.data.presence_id");

  const checkin2 = await requestJson("presence/checkin", {
    method: "POST",
    body: {
      user_id: primaryUser,
      device_id: "qa-dev-001",
      course_id: courseId,
      session_id: sessionId,
      qr_token: qrToken,
      ts: new Date().toISOString(),
    },
  });
  assert(checkin2.ok === false && checkin2.error === "already_checked_in", "second checkin must be already_checked_in.");

  const statusAfter = await requestJson("presence/status", {
    query: { user_id: primaryUser, course_id: courseId, session_id: sessionId },
  });
  assert(statusAfter.ok === true, "status after check-in must succeed.");
  assert(statusAfter.data.status === "checked_in", "status after must be checked_in.");
  assertStringField(statusAfter.data.user_id, "statusAfter.data.user_id");

  const list = await requestJson("presence/list", {
    query: { course_id: courseId, session_id: sessionId, limit: 20 },
  });
  assert(list.ok === true, "presence list must succeed.");
  assert(typeof list.data.total === "number", "list.data.total must be number.");
  assert(Array.isArray(list.data.items), "list.data.items must be array.");
  if (list.data.items.length > 0) {
    const firstItem = list.data.items[0];
    assertStringField(firstItem.presence_id, "list.data.items[0].presence_id");
    assertStringField(firstItem.user_id, "list.data.items[0].user_id");
    assertStringField(firstItem.device_id, "list.data.items[0].device_id");
  }

  const stop = await requestJson("presence/qr/stop", {
    method: "POST",
    body: {
      course_id: courseId,
      session_id: sessionId,
      ts: new Date().toISOString(),
    },
  });
  assert(stop.ok === true, "stop session must succeed.");
  assert(stop.data.status === "stopped", "stop status must be stopped.");

  const checkinAfterStop = await requestJson("presence/checkin", {
    method: "POST",
    body: {
      user_id: secondUser,
      device_id: "qa-dev-002",
      course_id: courseId,
      session_id: sessionId,
      qr_token: qrToken,
      ts: new Date().toISOString(),
    },
  });
  assert(
    checkinAfterStop.ok === false && checkinAfterStop.error === "session_closed",
    "checkin after stop must be session_closed.",
  );

  const report = {
    ok: true,
    scenario: "modul1_qr_smoke",
    session_id: sessionId,
    course_id: courseId,
    qr_token: qrToken,
    checks: {
      generate: generate.ok,
      status_before: statusBefore.data.status,
      checkin_first: checkin1.ok,
      checkin_second: checkin2.error,
      status_after: statusAfter.data.status,
      list_total: list.data.total,
      stop_status: stop.data.status,
      checkin_after_stop: checkinAfterStop.error,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        scenario: "modul1_qr_smoke",
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
