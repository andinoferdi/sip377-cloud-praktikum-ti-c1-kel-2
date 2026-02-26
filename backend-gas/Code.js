// ============================================================
// GAS Backend API v1 - Presensi QR Dinamis, Telemetry, GPS
// Routing: e.parameter.path | Runtime: V8 | TZ: Asia/Jakarta
// API-only mode: no HTML dashboard
// ============================================================

const SPREADSHEET_ID = '1TOjlTWE--TV-VZARworVPejpOYLURK5twpvrRcZ_gFA';

const SHEET = {
  TOKENS: 'tokens',
  PRESENCE: 'presence',
  ACCEL: 'accel',
  GPS: 'gps',
};

const HEADERS = {
  [SHEET.TOKENS]: ['qr_token', 'course_id', 'session_id', 'created_at', 'expires_at', 'used'],
  [SHEET.PRESENCE]: ['presence_id', 'user_id', 'device_id', 'course_id', 'session_id', 'qr_token', 'ts', 'recorded_at'],
  [SHEET.ACCEL]: ['device_id', 'x', 'y', 'z', 'sample_ts', 'batch_ts', 'recorded_at'],
  [SHEET.GPS]: ['device_id', 'lat', 'lng', 'accuracy_m', 'altitude_m', 'ts', 'recorded_at'],
};

const QR_TOKEN_TTL_MS = 120 * 1000;

function doGet(e) {
  try {
    const path = (e && e.parameter && e.parameter.path) ? e.parameter.path : '';
    const params = e && e.parameter ? e.parameter : {};

    switch (path) {
      case 'presence/status':
        return sendSuccess(getPresenceStatus(params.user_id, params.course_id, params.session_id));

      case 'telemetry/accel/latest':
        return sendSuccess(getAccelLatest(params.device_id));

      case 'telemetry/gps/latest':
        return sendSuccess(getGpsLatest(params.device_id));

      case 'telemetry/gps/history':
        return sendSuccess(getGpsHistory(params.device_id, params.limit, params.from, params.to));

      case 'ui':
      default:
        return sendSuccess(getApiInfo());
    }
  } catch (err) {
    return sendError(err && err.message ? err.message : String(err));
  }
}

function doPost(e) {
  try {
    const path = (e && e.parameter && e.parameter.path) ? e.parameter.path : '';
    const body = parseJsonBody(e);

    switch (path) {
      case 'presence/qr/generate':
        return sendSuccess(generateQRToken(body));

      case 'presence/checkin':
        return sendSuccess(checkin(body));

      case 'telemetry/accel':
        return sendSuccess(batchAccel(body));

      case 'telemetry/gps':
        return sendSuccess(logGPS(body));

      default:
        return sendError('unknown_endpoint: POST ?path=' + path);
    }
  } catch (err) {
    return sendError(err && err.message ? err.message : String(err));
  }
}

function parseJsonBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (_err) {
    throw new Error('invalid_json_body');
  }
}

function getApiInfo() {
  return {
    status: 'ok',
    mode: 'api_only',
    message: 'GAS Backend API v1 is running.',
    notes: ['No HTML dashboard is served by this deployment.'],
    endpoints: {
      GET: [
        '?path=presence/status',
        '?path=telemetry/accel/latest',
        '?path=telemetry/gps/latest',
        '?path=telemetry/gps/history',
        '?path=ui',
      ],
      POST: [
        '?path=presence/qr/generate',
        '?path=presence/checkin',
        '?path=telemetry/accel',
        '?path=telemetry/gps',
      ],
    },
  };
}

function sendSuccess(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendError(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: message || 'internal_error' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = HEADERS[name];

    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#4a86e8')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

function nowISO() {
  return new Date().toISOString();
}

function shortId(prefix, length) {
  return prefix + Utilities.getUuid().replace(/-/g, '').substring(0, length).toUpperCase();
}

function requireField(source, fieldName) {
  if (!source || source[fieldName] === undefined || source[fieldName] === null || source[fieldName] === '') {
    throw new Error('missing_field: ' + fieldName);
  }
}

function generateQRToken(body) {
  requireField(body, 'course_id');
  requireField(body, 'session_id');

  var sheet = getOrCreateSheet(SHEET.TOKENS);
  var now = body.ts ? new Date(body.ts) : new Date();
  var expiresAt = new Date(now.getTime() + QR_TOKEN_TTL_MS);
  var qrToken = shortId('TKN-', 6);

  sheet.appendRow([
    qrToken,
    String(body.course_id),
    String(body.session_id),
    now.toISOString(),
    expiresAt.toISOString(),
    false,
  ]);

  return {
    qr_token: qrToken,
    expires_at: expiresAt.toISOString(),
  };
}

function checkin(body) {
  requireField(body, 'user_id');
  requireField(body, 'device_id');
  requireField(body, 'course_id');
  requireField(body, 'session_id');
  requireField(body, 'qr_token');

  var tokensSheet = getOrCreateSheet(SHEET.TOKENS);
  var tokensData = tokensSheet.getDataRange().getValues();
  var tokenRowIndex = -1;
  var checkTime = body.ts ? new Date(body.ts) : new Date();

  for (var i = 1; i < tokensData.length; i++) {
    var rowToken = String(tokensData[i][0]);
    var rowCourse = String(tokensData[i][1]);
    var rowSession = String(tokensData[i][2]);
    var rowExpiresAt = new Date(tokensData[i][4]);
    var rowUsed = tokensData[i][5] === true || String(tokensData[i][5]).toLowerCase() === 'true';

    if (rowToken === String(body.qr_token) &&
        rowCourse === String(body.course_id) &&
        rowSession === String(body.session_id)) {
      if (rowUsed) {
        throw new Error('token_already_used');
      }

      if (checkTime > rowExpiresAt) {
        throw new Error('token_expired');
      }

      tokenRowIndex = i;
      break;
    }
  }

  if (tokenRowIndex < 0) {
    throw new Error('token_invalid');
  }

  tokensSheet.getRange(tokenRowIndex + 1, 6).setValue(true);

  var presenceSheet = getOrCreateSheet(SHEET.PRESENCE);
  var presenceId = shortId('PR-', 4);

  presenceSheet.appendRow([
    presenceId,
    String(body.user_id),
    String(body.device_id),
    String(body.course_id),
    String(body.session_id),
    String(body.qr_token),
    checkTime.toISOString(),
    nowISO(),
  ]);

  return {
    presence_id: presenceId,
    status: 'checked_in',
  };
}

function getPresenceStatus(userId, courseId, sessionId) {
  if (!userId) throw new Error('missing_field: user_id');
  if (!courseId) throw new Error('missing_field: course_id');
  if (!sessionId) throw new Error('missing_field: session_id');

  var sheet = getOrCreateSheet(SHEET.PRESENCE);
  var data = sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]) === String(userId) &&
        String(data[i][3]) === String(courseId) &&
        String(data[i][4]) === String(sessionId)) {
      return {
        user_id: String(userId),
        course_id: String(courseId),
        session_id: String(sessionId),
        status: 'checked_in',
        last_ts: data[i][6],
      };
    }
  }

  return {
    user_id: String(userId),
    course_id: String(courseId),
    session_id: String(sessionId),
    status: 'not_checked_in',
    last_ts: null,
  };
}

function batchAccel(body) {
  requireField(body, 'device_id');
  if (!Array.isArray(body.samples) || body.samples.length === 0) {
    throw new Error('missing_field: samples');
  }

  var sheet = getOrCreateSheet(SHEET.ACCEL);
  var batchTs = body.ts || nowISO();
  var recordedAt = nowISO();

  var rows = body.samples.map(function (sample) {
    return [
      String(body.device_id),
      sample && sample.x !== undefined ? sample.x : 0,
      sample && sample.y !== undefined ? sample.y : 0,
      sample && sample.z !== undefined ? sample.z : 0,
      sample && sample.t ? sample.t : nowISO(),
      batchTs,
      recordedAt,
    ];
  });

  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);

  return {
    accepted: rows.length,
  };
}

function getAccelLatest(deviceId) {
  if (!deviceId) {
    throw new Error('missing_field: device_id');
  }

  var sheet = getOrCreateSheet(SHEET.ACCEL);
  var data = sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(deviceId)) {
      return {
        t: data[i][4],
        x: data[i][1],
        y: data[i][2],
        z: data[i][3],
      };
    }
  }

  return {};
}

function logGPS(body) {
  requireField(body, 'device_id');
  if (body.lat === undefined || body.lat === null) {
    throw new Error('missing_field: lat');
  }
  if (body.lng === undefined || body.lng === null) {
    throw new Error('missing_field: lng');
  }

  var sheet = getOrCreateSheet(SHEET.GPS);

  sheet.appendRow([
    String(body.device_id),
    body.lat,
    body.lng,
    body.accuracy_m !== undefined && body.accuracy_m !== null ? body.accuracy_m : '',
    body.altitude_m !== undefined && body.altitude_m !== null ? body.altitude_m : '',
    body.ts || nowISO(),
    nowISO(),
  ]);

  return {
    accepted: true,
  };
}

function getGpsLatest(deviceId) {
  if (!deviceId) {
    throw new Error('missing_field: device_id');
  }

  var sheet = getOrCreateSheet(SHEET.GPS);
  var data = sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(deviceId)) {
      return {
        ts: data[i][5],
        lat: data[i][1],
        lng: data[i][2],
        accuracy_m: data[i][3] === '' ? null : data[i][3],
      };
    }
  }

  return {
    ts: null,
    lat: null,
    lng: null,
    accuracy_m: null,
  };
}

function getGpsHistory(deviceId, limit, from, to) {
  if (!deviceId) {
    throw new Error('missing_field: device_id');
  }

  var sheet = getOrCreateSheet(SHEET.GPS);
  var data = sheet.getDataRange().getValues();

  var maxItems = limit ? parseInt(limit, 10) : 200;
  if (isNaN(maxItems) || maxItems <= 0) {
    maxItems = 200;
  }

  var now = new Date();
  var startTime = from ? new Date(from) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
  var endTime = to ? new Date(to) : now;

  var points = [];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) !== String(deviceId)) {
      continue;
    }

    var rowTime = new Date(data[i][5]);
    if (rowTime >= startTime && rowTime <= endTime) {
      var point = {
        ts: data[i][5],
        lat: data[i][1],
        lng: data[i][2],
      };
      if (data[i][3] !== '' && data[i][3] !== null && data[i][3] !== undefined) {
        point.accuracy_m = data[i][3];
      }
      points.push(point);
    }
  }

  points.sort(function (a, b) {
    return new Date(a.ts) - new Date(b.ts);
  });

  var startIndex = Math.max(points.length - maxItems, 0);
  var limited = points.slice(startIndex);

  return {
    device_id: String(deviceId),
    items: limited,
  };
}
