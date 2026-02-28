// =========================================================
//  Modul 1: Presensi QR Dinamis
//  Backend: Google Apps Script (GAS) + Google Sheets
//  Kelompok 3 — v2
// =========================================================

// ---- KONFIGURASI ----------------------------------------
var SPREADSHEET_ID = '1NX23_Bx1kfb8khAJgPfZ9RnvnpCtAz9h1MR4DxQGGHI';
var TOKEN_EXPIRY_MINUTES = 2;

var SHEET_TOKENS   = 'tokens';
var SHEET_PRESENCE = 'presence';
var SHEET_SESSIONS = 'sessions';

// ---- HELPER: BUKA SHEET ---------------------------------
function getSheet(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    // Auto-create sheet with headers if it doesn't exist
    sheet = ss.insertSheet(name);
    if (name === SHEET_TOKENS) {
      sheet.appendRow(['qr_token', 'course_id', 'session_id', 'created_at', 'expires_at', 'used']);
    } else if (name === SHEET_PRESENCE) {
      sheet.appendRow(['presence_id', 'user_id', 'device_id', 'course_id', 'session_id', 'qr_token', 'ts', 'recorded_at']);
    } else if (name === SHEET_SESSIONS) {
      sheet.appendRow(['session_id', 'session_name', 'course_id', 'created_at']);
    }
  }
  return sheet;
}

// ---- HELPER: FORMAT RESPONSE ----------------------------
function respond(ok, data) {
  var payload = JSON.stringify({ ok: ok, data: data });
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

function respondError(msg) {
  var payload = JSON.stringify({ ok: false, error: msg });
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- HELPER: GENERATE TOKEN ACAK ------------------------
function generateToken() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var token = 'TKN-';
  for (var i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ---- HELPER: PARSE ROUTE --------------------------------
function getRoute(e, body) {
  try {
    var pathInfo = (e.pathInfo || '').replace(/^\/+/, '');
    if (pathInfo) return pathInfo;
  } catch (err) {}

  try {
    if (e.parameter && e.parameter.action) return e.parameter.action;
  } catch (err) {}

  if (body && body.action) return body.action;
  return '';
}

// =========================================================
//  ROUTER — POST
// =========================================================
function doPost(e) {
  try {
    var body = {};
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return respondError('invalid_json');
    }

    var route = getRoute(e, body);

    if (route === 'presence/qr/generate')     return generateQR(body);
    if (route === 'presence/checkin')          return checkIn(body);
    if (route === 'presence/sessions/create')  return createSession(body);

    return respondError('unknown_path: ' + route);
  } catch (err) {
    return respondError('server_error: ' + err.message);
  }
}

// =========================================================
//  ROUTER — GET
// =========================================================
function doGet(e) {
  try {
    var route = getRoute(e, null);
    var params = e.parameter || {};

    if (route === 'presence/status')             return getStatus(params);
    if (route === 'presence/sessions')           return listSessions(params);
    if (route === 'presence/session-attendance') return getSessionAttendance(params);

    var info = JSON.stringify({
      ok: true,
      data: {
        service: 'Presensi QR Dinamis v2',
        endpoints: [
          'POST /presence/qr/generate',
          'POST /presence/checkin',
          'POST /presence/sessions/create',
          'GET  /presence/sessions',
          'GET  /presence/session-attendance?session_id=&course_id=',
          'GET  /presence/status?user_id=&course_id=&session_id='
        ]
      }
    });
    return ContentService.createTextOutput(info).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return respondError('server_error: ' + err.message);
  }
}

// =========================================================
//  SESSIONS: Create
// =========================================================
function createSession(body) {
  if (!body.session_id)   return respondError('missing_field: session_id');
  if (!body.session_name) return respondError('missing_field: session_name');
  if (!body.course_id)    return respondError('missing_field: course_id');

  var sheet = getSheet(SHEET_SESSIONS);
  var data = sheet.getDataRange().getValues();

  // Check duplicate
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(body.session_id).trim() &&
        String(data[i][2]).trim() === String(body.course_id).trim()) {
      return respondError('session_exists');
    }
  }

  sheet.appendRow([
    body.session_id,
    body.session_name,
    body.course_id,
    new Date().toISOString()
  ]);

  return respond(true, {
    session_id: body.session_id,
    session_name: body.session_name,
    course_id: body.course_id
  });
}

// =========================================================
//  SESSIONS: List
// =========================================================
function listSessions(params) {
  var courseId = params.course_id || '';
  var sheet = getSheet(SHEET_SESSIONS);
  var data = sheet.getDataRange().getValues();
  // Header: [session_id, session_name, course_id, created_at]

  var sessions = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (courseId && String(row[2]).trim() !== courseId) continue;
    sessions.push({
      session_id: String(row[0]).trim(),
      session_name: String(row[1]).trim(),
      course_id: String(row[2]).trim(),
      created_at: String(row[3])
    });
  }

  return respond(true, { sessions: sessions });
}

// =========================================================
//  Generate QR Token
// =========================================================
function generateQR(body) {
  if (!body.course_id)  return respondError('missing_field: course_id');
  if (!body.session_id) return respondError('missing_field: session_id');

  var token     = generateToken();
  var now       = new Date();
  var expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
  var createdAt = now.toISOString();
  var expiresAtISO = expiresAt.toISOString();

  var sheet = getSheet(SHEET_TOKENS);
  // Schema: qr_token, course_id, session_id, created_at, expires_at, used
  sheet.appendRow([
    token,
    body.course_id,
    body.session_id,
    createdAt,
    expiresAtISO,
    false
  ]);

  return respond(true, {
    qr_token: token,
    expires_at: expiresAtISO,
    course_id: body.course_id,
    session_id: body.session_id
  });
}

// =========================================================
//  Check-in
//  Body: { user_id, device_id, qr_token, ts }
//  course_id & session_id are read from the TOKEN row
// =========================================================
function checkIn(body) {
  if (!body.user_id)   return respondError('missing_field: user_id');
  if (!body.device_id) return respondError('missing_field: device_id');
  if (!body.qr_token)  return respondError('missing_field: qr_token');

  var receivedToken = String(body.qr_token).trim();

  // Find token in sheet
  var tokenSheet = getSheet(SHEET_TOKENS);
  var tokenData  = tokenSheet.getDataRange().getValues();
  // Header: [qr_token, course_id, session_id, created_at, expires_at, used]

  var tokenFound  = false;
  var tokenExpired = false;
  var tokenRow = -1;
  var tokenCourseId = '';
  var tokenSessionId = '';

  var now = new Date();

  for (var r = 1; r < tokenData.length; r++) {
    var row = tokenData[r];
    if (String(row[0]).trim() === receivedToken) {
      tokenFound = true;
      tokenRow = r;
      tokenCourseId = String(row[1]).trim();
      tokenSessionId = String(row[2]).trim();
      var expiresAt = new Date(row[4]); // expires_at is column 4
      if (now > expiresAt) {
        tokenExpired = true;
      }
      break;
    }
  }

  if (!tokenFound) {
    return respondError('token_invalid');
  }
  if (tokenExpired) return respondError('token_expired');

  // Mark token as used
  tokenSheet.getRange(tokenRow + 1, 6).setValue(true); // +1 for 1-indexed, col 6 = used

  // Check if user already checked in for this session
  var presenceSheet = getSheet(SHEET_PRESENCE);
  var presenceData  = presenceSheet.getDataRange().getValues();

  for (var p = 1; p < presenceData.length; p++) {
    var pRow = presenceData[p];
    if (String(pRow[1]).trim() === String(body.user_id).trim() &&
        String(pRow[3]).trim() === tokenCourseId &&
        String(pRow[4]).trim() === tokenSessionId) {
      return respond(true, {
        presence_id: String(pRow[0]),
        status: 'checked_in',
        note: 'already_checked_in',
        course_id: tokenCourseId,
        session_id: tokenSessionId
      });
    }
  }

  var presenceId = 'PR-' + String(presenceSheet.getLastRow()).padStart(4, '0');
  var recordedAt = now.toISOString();

  // Schema: presence_id, user_id, device_id, course_id, session_id, qr_token, ts, recorded_at
  presenceSheet.appendRow([
    presenceId,
    body.user_id,
    body.device_id,
    tokenCourseId,
    tokenSessionId,
    body.qr_token,
    body.ts || recordedAt,
    recordedAt
  ]);

  return respond(true, {
    presence_id: presenceId,
    status: 'checked_in',
    course_id: tokenCourseId,
    session_id: tokenSessionId
  });
}

// =========================================================
//  Session Attendance — real-time list
// =========================================================
function getSessionAttendance(params) {
  if (!params.session_id) return respondError('missing_field: session_id');
  if (!params.course_id)  return respondError('missing_field: course_id');

  var presenceSheet = getSheet(SHEET_PRESENCE);
  var data = presenceSheet.getDataRange().getValues();
  // Header: [presence_id, user_id, device_id, course_id, session_id, qr_token, ts, recorded_at]

  var attendees = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[3]).trim() === String(params.course_id).trim() &&
        String(row[4]).trim() === String(params.session_id).trim()) {
      attendees.push({
        presence_id: String(row[0]),
        user_id: String(row[1]),
        ts: String(row[6]),
        recorded_at: String(row[7])
      });
    }
  }

  return respond(true, {
    course_id: params.course_id,
    session_id: params.session_id,
    total: attendees.length,
    attendees: attendees
  });
}

// =========================================================
//  Status Check
// =========================================================
function getStatus(params) {
  if (!params.user_id)    return respondError('missing_field: user_id');
  if (!params.course_id)  return respondError('missing_field: course_id');
  if (!params.session_id) return respondError('missing_field: session_id');

  var presenceSheet = getSheet(SHEET_PRESENCE);
  var presenceData  = presenceSheet.getDataRange().getValues();

  for (var r = 1; r < presenceData.length; r++) {
    var row = presenceData[r];
    if (String(row[1]).trim() === String(params.user_id).trim() &&
        String(row[3]).trim() === String(params.course_id).trim() &&
        String(row[4]).trim() === String(params.session_id).trim()) {
      return respond(true, {
        user_id:    String(row[1]),
        course_id:  String(row[3]),
        session_id: String(row[4]),
        status:     'checked_in',
        last_ts:    String(row[6])
      });
    }
  }

  return respond(true, {
    user_id:    params.user_id,
    course_id:  params.course_id,
    session_id: params.session_id,
    status:     'not_present',
    last_ts:    null
  });
}

