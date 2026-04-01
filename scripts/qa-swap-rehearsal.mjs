#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

function parseArgValue(prefix) {
  const matched = process.argv.find((arg) => arg.startsWith(prefix));
  if (!matched) return "";
  return matched.slice(prefix.length).trim();
}

const ownBaseUrl = normalizeBaseUrl(
  process.env.OWN_BASE_URL ||
    process.env.NEXT_PUBLIC_GAS_BASE_URL ||
    readBaseUrlFromDotEnv(),
);
const partnerBaseUrl = normalizeBaseUrl(process.env.PARTNER_BASE_URL);
const allowSameBaseUrl = process.env.ALLOW_SAME_BASE_URL === "1";
const reportDirArg = parseArgValue("--report-dir=");
const reportDir = resolve(
  process.cwd(),
  reportDirArg || ".qa-artifacts/swap-rehearsal",
);

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

if (!allowSameBaseUrl && ownBaseUrl === partnerBaseUrl) {
  console.error("OWN_BASE_URL dan PARTNER_BASE_URL tidak boleh sama untuk swap test nyata.");
  console.error(
    "Jika hanya rehearsal internal, set ALLOW_SAME_BASE_URL=1.",
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
  const url = buildUrl(baseUrl, path, query);
  const response = await fetch(url, {
    method,
    headers:
      method === "POST"
        ? { "Content-Type": "text/plain;charset=UTF-8" }
        : undefined,
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    redirect: "follow",
  });
  return {
    url,
    status: response.status,
    body: await response.json(),
  };
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
  assert(generate.status === 200, "modul1: HTTP generate QR bukan 200");
  assert(generate.body.ok === true, "modul1: generate QR gagal");
  const qrToken = generate.body.data?.qr_token;
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
  assert(checkin.status === 200, "modul1: HTTP checkin pertama bukan 200");
  assert(checkin.body.ok === true, "modul1: checkin pertama gagal");

  const status = await requestJson(baseUrl, "presence/status", {
    query: {
      user_id: checkinUserA,
      course_id: courseId,
      session_id: sessionId,
    },
  });
  assert(status.status === 200, "modul1: HTTP status bukan 200");
  assert(status.body.ok === true, "modul1: status gagal");
  assert(status.body.data?.status === "checked_in", "modul1: status bukan checked_in");

  const list = await requestJson(baseUrl, "presence/list", {
    query: {
      course_id: courseId,
      session_id: sessionId,
      limit: 20,
    },
  });
  assert(list.status === 200, "modul1: HTTP list bukan 200");
  assert(list.body.ok === true, "modul1: list gagal");
  assert(Array.isArray(list.body.data?.items), "modul1: list items bukan array");
  assert(list.body.data.items.length > 0, "modul1: list masih kosong");

  const stop = await requestJson(baseUrl, "presence/qr/stop", {
    method: "POST",
    body: {
      course_id: courseId,
      session_id: sessionId,
      ts: new Date().toISOString(),
    },
  });
  assert(stop.status === 200, "modul1: HTTP stop session bukan 200");
  assert(stop.body.ok === true, "modul1: stop session gagal");

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
    checkinAfterStop.status === 200 &&
      checkinAfterStop.body.ok === false &&
      checkinAfterStop.body.error === "session_closed",
    "modul1: checkin setelah stop harus session_closed",
  );

  return {
    ok: true,
    course_id: courseId,
    session_id: sessionId,
    qr_token: qrToken,
    total_presence: list.body.data.items.length,
    evidence: {
      generate_url: generate.url,
      checkin_url: checkin.url,
      list_url: list.url,
      stop_url: stop.url,
      http_statuses: {
        generate: generate.status,
        checkin: checkin.status,
        list: list.status,
        stop: stop.status,
      },
    },
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
  assert(post.status === 200, "modul2: HTTP POST telemetry/accel bukan 200");
  assert(post.body.ok === true, "modul2: POST telemetry/accel gagal");
  assert(post.body.data?.accepted === 2, "modul2: accepted tidak sesuai");

  const latest = await requestJson(baseUrl, "telemetry/accel/latest", {
    query: {
      device_id: deviceId,
    },
  });
  assert(latest.status === 200, "modul2: HTTP latest bukan 200");
  assert(latest.body.ok === true, "modul2: latest gagal");
  assert(typeof latest.body.data?.x === "number", "modul2: latest x tidak valid");

  const history = await requestJson(baseUrl, "telemetry/accel/history", {
    query: {
      device_id: deviceId,
      limit: 10,
      from: new Date(now - 60_000).toISOString(),
      to: new Date(now + 10_000).toISOString(),
    },
  });
  assert(history.status === 200, "modul2: HTTP history bukan 200");
  assert(history.body.ok === true, "modul2: history gagal");
  assert(Array.isArray(history.body.data?.items), "modul2: history items bukan array");
  assert(history.body.data.items.length > 0, "modul2: history kosong");

  return {
    ok: true,
    device_id: deviceId,
    accepted: post.body.data.accepted,
    latest: history.body.data.items[history.body.data.items.length - 1] ?? null,
    history_total: history.body.data.items.length,
    evidence: {
      post_url: post.url,
      latest_url: latest.url,
      history_url: history.url,
      http_statuses: {
        post: post.status,
        latest: latest.status,
        history: history.status,
      },
    },
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
  assert(post1.status === 200, "modul3: HTTP POST gps pertama bukan 200");
  assert(post1.body.ok === true, "modul3: POST gps pertama gagal");

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
  assert(post2.status === 200, "modul3: HTTP POST gps kedua bukan 200");
  assert(post2.body.ok === true, "modul3: POST gps kedua gagal");

  const latest = await requestJson(baseUrl, "telemetry/gps/latest", {
    query: {
      device_id: deviceId,
    },
  });
  assert(latest.status === 200, "modul3: HTTP latest bukan 200");
  assert(latest.body.ok === true, "modul3: latest gagal");
  assert(typeof latest.body.data?.lat === "number", "modul3: latest lat tidak valid");

  const history = await requestJson(baseUrl, "telemetry/gps/history", {
    query: {
      device_id: deviceId,
      limit: 200,
      from: new Date(now - 60_000).toISOString(),
      to: new Date(now + 60_000).toISOString(),
    },
  });
  assert(history.status === 200, "modul3: HTTP history bukan 200");
  assert(history.body.ok === true, "modul3: history gagal");
  assert(Array.isArray(history.body.data?.items), "modul3: history items bukan array");
  assert(history.body.data.items.length >= 2, "modul3: history kurang dari 2 titik");

  return {
    ok: true,
    device_id: deviceId,
    latest: latest.body.data,
    history_total: history.body.data.items.length,
    evidence: {
      post_1_url: post1.url,
      post_2_url: post2.url,
      latest_url: latest.url,
      history_url: history.url,
      http_statuses: {
        post_1: post1.status,
        post_2: post2.status,
        latest: latest.status,
        history: history.status,
      },
    },
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

function modulesAllPassed(scenario) {
  return (
    scenario.modules.modul1?.ok === true &&
    scenario.modules.modul2?.ok === true &&
    scenario.modules.modul3?.ok === true
  );
}

function buildEvidenceSummary(result) {
  const [scenarioA, scenarioB] = result.scenarios;
  return {
    criteria: {
      distinct_sender_visualizer_urls: result.own_base_url !== result.partner_base_url,
      scenario_a_all_modules_passed: modulesAllPassed(scenarioA),
      scenario_b_all_modules_passed: modulesAllPassed(scenarioB),
      reverse_flow_passed: scenarioA.ok === true && scenarioB.ok === true,
      no_single_server_dependency: result.own_base_url !== result.partner_base_url,
    },
    presentation_notes: [
      "Tunjukkan panel Swap Control: Own GAS URL dan Partner GAS URL.",
      "Preset A harus sender -> partner dan visualizer -> own.",
      "Preset B harus sender -> own dan visualizer -> partner.",
      "Tunjukkan bukti URL request per modul dari report JSON/Markdown.",
      "Tunjukkan pertambahan row pada sheet target partner.",
    ],
  };
}

function buildMarkdownReport(result) {
  const summary = buildEvidenceSummary(result);
  const lines = [];
  lines.push("# Swap Rehearsal Evidence");
  lines.push("");
  lines.push(`- Generated at: ${new Date().toISOString()}`);
  lines.push(`- Own base URL: ${result.own_base_url}`);
  lines.push(`- Partner base URL: ${result.partner_base_url}`);
  lines.push(`- Overall status: ${result.ok ? "PASS" : "FAIL"}`);
  lines.push("");
  lines.push("## Criteria");
  lines.push(
    `- Distinct sender/visualizer URLs: ${
      summary.criteria.distinct_sender_visualizer_urls ? "PASS" : "FAIL"
    }`,
  );
  lines.push(
    `- Scenario A all modules passed: ${
      summary.criteria.scenario_a_all_modules_passed ? "PASS" : "FAIL"
    }`,
  );
  lines.push(
    `- Scenario B all modules passed: ${
      summary.criteria.scenario_b_all_modules_passed ? "PASS" : "FAIL"
    }`,
  );
  lines.push(
    `- Reverse flow passed (A and B): ${
      summary.criteria.reverse_flow_passed ? "PASS" : "FAIL"
    }`,
  );
  lines.push(
    `- No single-server dependency: ${
      summary.criteria.no_single_server_dependency ? "PASS" : "FAIL"
    }`,
  );
  lines.push("");
  lines.push("## Scenario Details");

  for (const scenario of result.scenarios) {
    lines.push(`### ${scenario.scenario}`);
    lines.push(`- Target base URL: ${scenario.target_base_url}`);
    lines.push(`- Status: ${scenario.ok ? "PASS" : "FAIL"}`);
    lines.push(`- Modul 1: ${scenario.modules.modul1?.ok ? "PASS" : "FAIL"}`);
    lines.push(`- Modul 2: ${scenario.modules.modul2?.ok ? "PASS" : "FAIL"}`);
    lines.push(`- Modul 3: ${scenario.modules.modul3?.ok ? "PASS" : "FAIL"}`);
    lines.push("");
  }

  lines.push("## Presentation Checklist");
  for (const note of summary.presentation_notes) {
    lines.push(`- ${note}`);
  }
  lines.push("");
  return lines.join("\n");
}

function writeEvidenceArtifacts(result) {
  mkdirSync(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = resolve(reportDir, `swap-rehearsal-${stamp}.json`);
  const mdPath = resolve(reportDir, `swap-rehearsal-${stamp}.md`);
  const finalJsonPath = resolve(reportDir, "latest.json");
  const finalMdPath = resolve(reportDir, "latest.md");

  const payload = {
    ...result,
    evidence_summary: buildEvidenceSummary(result),
  };
  const markdown = buildMarkdownReport(payload);

  const payloadRaw = `${JSON.stringify(payload, null, 2)}\n`;
  writeFileSync(jsonPath, payloadRaw, "utf8");
  writeFileSync(mdPath, markdown, "utf8");
  writeFileSync(finalJsonPath, payloadRaw, "utf8");
  writeFileSync(finalMdPath, markdown, "utf8");

  return {
    jsonPath,
    mdPath,
    latestJsonPath: finalJsonPath,
    latestMdPath: finalMdPath,
  };
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

  const artifact = writeEvidenceArtifacts(result);
  const output = {
    ...result,
    artifact,
    evidence_summary: buildEvidenceSummary(result),
  };
  console.log(JSON.stringify(output, null, 2));

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
