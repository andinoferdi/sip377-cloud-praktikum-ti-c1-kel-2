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
  SESSION_STATE: 'session_state',
};

const HEADERS = {
  [SHEET.TOKENS]: ['qr_token', 'course_id', 'session_id', 'created_at', 'expires_at', 'used', 'meeting_key', 'owner_identifier'],
  [SHEET.PRESENCE]: ['presence_id', 'user_id', 'device_id', 'course_id', 'session_id', 'qr_token', 'ts', 'recorded_at', 'meeting_key'],
  [SHEET.ACCEL]: ['device_id', 'x', 'y', 'z', 'sample_ts', 'batch_ts', 'recorded_at'],
  [SHEET.GPS]: ['device_id', 'lat', 'lng', 'accuracy_m', 'altitude_m', 'ts', 'recorded_at'],
  [SHEET.SESSION_STATE]: ['course_id', 'session_id', 'is_stopped', 'started_at', 'stopped_at', 'updated_at', 'owner_identifier', 'meeting_key'],
};

const HEADER_ALIASES = {
  [SHEET.TOKENS]: {
    used: ['is_used'],
  },
};

const QR_TOKEN_TTL_MS = 120 * 1000;

function doGet(e) {
  try {
    const path = (e && e.parameter && e.parameter.path) ? e.parameter.path : '';
    const params = e && e.parameter ? e.parameter : {};

    switch (path) {
      case 'presence/status':
        return sendSuccess(getPresenceStatus(params.user_id, params.course_id, params.session_id));

      case 'presence/list':
        return sendSuccess(getPresenceList(params.course_id, params.session_id, params.limit));

      case 'presence/sessions/active':
        return sendSuccess(getActiveSessions(params.owner_identifier, params.limit, params.course_id));

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

      case 'presence/qr/stop':
        return sendSuccess(stopQrSession(body));

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
        '?path=presence/list',
        '?path=presence/sessions/active',
        '?path=telemetry/accel/latest',
        '?path=telemetry/gps/latest',
        '?path=telemetry/gps/history',
        '?path=ui',
      ],
      POST: [
        '?path=presence/qr/generate',
        '?path=presence/checkin',
        '?path=presence/qr/stop',
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

function normalizeCourseId(value) {
  return String(value).trim().toLowerCase();
}

function normalizeSessionId(value) {
  return String(value).trim().toLowerCase();
}

function normalizeToken(value) {
  return String(value).trim().toUpperCase();
}

function normalizeOwnerIdentifier(value) {
  return String(value).trim();
}

function normalizeMeetingKey(value) {
  return String(value).trim().toUpperCase();
}

function createMeetingKey() {
  return shortId('MTG-', 8);
}

function toHeaderKey(value) {
  return String(value || '').trim().toLowerCase();
}

function getHeaderAliases(sheetName, headerName) {
  var sheetAliases = HEADER_ALIASES[sheetName];
  if (!sheetAliases) {
    return [];
  }
  var aliases = sheetAliases[headerName];
  return Array.isArray(aliases) ? aliases : [];
}

function ensureSheetHeaders(sheetName, sheet) {
  var requiredHeaders = HEADERS[sheetName];
  if (!requiredHeaders || requiredHeaders.length === 0) {
    return;
  }

  var lastColumn = Math.max(sheet.getLastColumn(), requiredHeaders.length);
  if (lastColumn <= 0) {
    lastColumn = requiredHeaders.length;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var existingMap = {};

  for (var i = 0; i < currentHeaders.length; i++) {
    var normalizedCurrent = toHeaderKey(currentHeaders[i]);
    if (normalizedCurrent) {
      existingMap[normalizedCurrent] = i;
    }
  }

  var toAppend = [];
  for (var j = 0; j < requiredHeaders.length; j++) {
    var requiredHeader = requiredHeaders[j];
    var normalizedRequired = toHeaderKey(requiredHeader);

    if (existingMap[normalizedRequired] !== undefined) {
      continue;
    }

    var aliases = getHeaderAliases(sheetName, normalizedRequired);
    var hasAlias = false;

    for (var k = 0; k < aliases.length; k++) {
      if (existingMap[toHeaderKey(aliases[k])] !== undefined) {
        hasAlias = true;
        break;
      }
    }

    if (!hasAlias) {
      toAppend.push(requiredHeader);
    }
  }

  if (toAppend.length > 0) {
    var appendStart = sheet.getLastColumn() + 1;
    sheet.getRange(1, appendStart, 1, toAppend.length).setValues([toAppend]);
    sheet.getRange(1, appendStart, 1, toAppend.length)
      .setFontWeight('bold')
      .setBackground('#4a86e8')
      .setFontColor('#ffffff');
  }

  if (sheet.getFrozenRows() < 1) {
    sheet.setFrozenRows(1);
  }
}

function getSheetMeta(name) {
  var sheet = getOrCreateSheet(name);
  ensureSheetHeaders(name, sheet);

  var requiredHeaders = HEADERS[name] || [];
  var columnCount = Math.max(sheet.getLastColumn(), requiredHeaders.length);
  var headerRow = columnCount > 0
    ? sheet.getRange(1, 1, 1, columnCount).getValues()[0]
    : [];

  var headerMap = {};

  for (var i = 0; i < headerRow.length; i++) {
    var normalizedHeader = toHeaderKey(headerRow[i]);
    if (normalizedHeader) {
      headerMap[normalizedHeader] = i;
    }
  }

  for (var j = 0; j < requiredHeaders.length; j++) {
    var requiredHeader = requiredHeaders[j];
    var normalizedRequiredHeader = toHeaderKey(requiredHeader);

    if (headerMap[normalizedRequiredHeader] !== undefined) {
      continue;
    }

    var aliases = getHeaderAliases(name, normalizedRequiredHeader);
    for (var k = 0; k < aliases.length; k++) {
      var aliasIndex = headerMap[toHeaderKey(aliases[k])];
      if (aliasIndex !== undefined) {
        headerMap[normalizedRequiredHeader] = aliasIndex;
        break;
      }
    }
  }

  return {
    sheet: sheet,
    headerMap: headerMap,
    columnCount: columnCount,
  };
}

function getValueByHeader(row, headerMap, headerName) {
  var index = headerMap[toHeaderKey(headerName)];
  if (index === undefined) {
    return '';
  }
  return row[index];
}

function setValueByHeader(row, headerMap, headerName, value) {
  var index = headerMap[toHeaderKey(headerName)];
  if (index === undefined) {
    return;
  }
  row[index] = value;
}

function getSessionState(criteria) {
  if (!criteria) {
    return null;
  }

  var normalizedMeetingKey = criteria.meetingKey
    ? normalizeMeetingKey(criteria.meetingKey)
    : '';
  var normalizedCourseId = criteria.courseId
    ? normalizeCourseId(criteria.courseId)
    : '';
  var normalizedSessionId = criteria.sessionId
    ? normalizeSessionId(criteria.sessionId)
    : '';
  var normalizedOwnerIdentifier = criteria.ownerIdentifier
    ? normalizeOwnerIdentifier(criteria.ownerIdentifier)
    : '';

  var sessionMeta = getSheetMeta(SHEET.SESSION_STATE);
  var data = sessionMeta.sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    var rowMeetingKey = normalizeMeetingKey(
      getValueByHeader(data[i], sessionMeta.headerMap, 'meeting_key') || '',
    );
    var rowCourseId = normalizeCourseId(
      getValueByHeader(data[i], sessionMeta.headerMap, 'course_id') || '',
    );
    var rowSessionId = normalizeSessionId(
      getValueByHeader(data[i], sessionMeta.headerMap, 'session_id') || '',
    );
    var rowOwnerIdentifier = normalizeOwnerIdentifier(
      getValueByHeader(data[i], sessionMeta.headerMap, 'owner_identifier') || '',
    );

    if (normalizedMeetingKey) {
      if (rowMeetingKey !== normalizedMeetingKey) {
        continue;
      }
    } else if (normalizedCourseId && normalizedSessionId) {
      if (rowCourseId !== normalizedCourseId || rowSessionId !== normalizedSessionId) {
        continue;
      }
    } else {
      continue;
    }

    if (normalizedOwnerIdentifier && rowOwnerIdentifier && rowOwnerIdentifier !== normalizedOwnerIdentifier) {
      continue;
    }

    return {
      row: i + 1,
      course_id: rowCourseId,
      session_id: rowSessionId,
      meeting_key: rowMeetingKey || null,
      owner_identifier: rowOwnerIdentifier || null,
      is_stopped: getValueByHeader(data[i], sessionMeta.headerMap, 'is_stopped') === true ||
        String(getValueByHeader(data[i], sessionMeta.headerMap, 'is_stopped')).toLowerCase() === 'true',
      started_at: getValueByHeader(data[i], sessionMeta.headerMap, 'started_at')
        ? String(getValueByHeader(data[i], sessionMeta.headerMap, 'started_at'))
        : null,
      stopped_at: getValueByHeader(data[i], sessionMeta.headerMap, 'stopped_at')
        ? String(getValueByHeader(data[i], sessionMeta.headerMap, 'stopped_at'))
        : null,
      updated_at: getValueByHeader(data[i], sessionMeta.headerMap, 'updated_at')
        ? String(getValueByHeader(data[i], sessionMeta.headerMap, 'updated_at'))
        : null,
    };
  }

  return null;
}

function upsertSessionState(params) {
  var normalizedCourseId = normalizeCourseId(params.courseId);
  var normalizedSessionId = normalizeSessionId(params.sessionId);
  var normalizedMeetingKey = params.meetingKey
    ? normalizeMeetingKey(params.meetingKey)
    : '';
  var normalizedOwnerIdentifier = params.ownerIdentifier
    ? normalizeOwnerIdentifier(params.ownerIdentifier)
    : '';
  var isStopped = params.isStopped === true;
  var now = params.eventTimeISO || nowISO();
  var sessionMeta = getSheetMeta(SHEET.SESSION_STATE);

  var existingState = getSessionState({
    meetingKey: normalizedMeetingKey || null,
    courseId: normalizedCourseId,
    sessionId: normalizedSessionId,
    ownerIdentifier: normalizedOwnerIdentifier || null,
  });

  if (!existingState) {
    var appendRow = new Array(sessionMeta.columnCount);
    for (var i = 0; i < appendRow.length; i++) {
      appendRow[i] = '';
    }
    setValueByHeader(appendRow, sessionMeta.headerMap, 'course_id', normalizedCourseId);
    setValueByHeader(appendRow, sessionMeta.headerMap, 'session_id', normalizedSessionId);
    setValueByHeader(appendRow, sessionMeta.headerMap, 'is_stopped', isStopped);
    setValueByHeader(appendRow, sessionMeta.headerMap, 'started_at', now);
    setValueByHeader(appendRow, sessionMeta.headerMap, 'stopped_at', isStopped ? now : '');
    setValueByHeader(appendRow, sessionMeta.headerMap, 'updated_at', now);
    setValueByHeader(appendRow, sessionMeta.headerMap, 'owner_identifier', normalizedOwnerIdentifier);
    setValueByHeader(appendRow, sessionMeta.headerMap, 'meeting_key', normalizedMeetingKey);
    sessionMeta.sheet.appendRow(appendRow);

    return {
      course_id: normalizedCourseId,
      session_id: normalizedSessionId,
      meeting_key: normalizedMeetingKey || null,
      owner_identifier: normalizedOwnerIdentifier || null,
      is_stopped: isStopped,
      started_at: now,
      stopped_at: isStopped ? now : null,
      updated_at: now,
    };
  }

  var existingRow = sessionMeta.sheet
    .getRange(existingState.row, 1, 1, sessionMeta.columnCount)
    .getValues()[0];
  var startedAt = existingState.started_at || now;

  setValueByHeader(existingRow, sessionMeta.headerMap, 'course_id', normalizedCourseId);
  setValueByHeader(existingRow, sessionMeta.headerMap, 'session_id', normalizedSessionId);
  setValueByHeader(existingRow, sessionMeta.headerMap, 'is_stopped', isStopped);
  setValueByHeader(existingRow, sessionMeta.headerMap, 'started_at', startedAt);
  setValueByHeader(existingRow, sessionMeta.headerMap, 'stopped_at', isStopped ? now : '');
  setValueByHeader(existingRow, sessionMeta.headerMap, 'updated_at', now);
  if (normalizedOwnerIdentifier) {
    setValueByHeader(existingRow, sessionMeta.headerMap, 'owner_identifier', normalizedOwnerIdentifier);
  }
  if (normalizedMeetingKey) {
    setValueByHeader(existingRow, sessionMeta.headerMap, 'meeting_key', normalizedMeetingKey);
  }

  sessionMeta.sheet
    .getRange(existingState.row, 1, 1, sessionMeta.columnCount)
    .setValues([existingRow]);

  return {
    course_id: normalizeCourseId(getValueByHeader(existingRow, sessionMeta.headerMap, 'course_id')),
    session_id: normalizeSessionId(getValueByHeader(existingRow, sessionMeta.headerMap, 'session_id')),
    meeting_key: normalizeMeetingKey(getValueByHeader(existingRow, sessionMeta.headerMap, 'meeting_key') || '') || null,
    owner_identifier: normalizeOwnerIdentifier(getValueByHeader(existingRow, sessionMeta.headerMap, 'owner_identifier') || '') || null,
    is_stopped: isStopped,
    started_at: startedAt,
    stopped_at: isStopped ? now : null,
    updated_at: now,
  };
}

function generateQRToken(body) {
  requireField(body, 'course_id');
  requireField(body, 'session_id');

  var normalizedCourseId = normalizeCourseId(body.course_id);
  var normalizedSessionId = normalizeSessionId(body.session_id);
  var normalizedOwnerIdentifier = body.owner_identifier
    ? normalizeOwnerIdentifier(body.owner_identifier)
    : '';
  var meetingKey = body.meeting_key
    ? normalizeMeetingKey(body.meeting_key)
    : createMeetingKey();
  var tokensMeta = getSheetMeta(SHEET.TOKENS);
  var now = body.ts ? new Date(body.ts) : new Date();
  var expiresAt = new Date(now.getTime() + QR_TOKEN_TTL_MS);
  var qrToken = shortId('TKN-', 6);

  var appendRow = new Array(tokensMeta.columnCount);
  for (var i = 0; i < appendRow.length; i++) {
    appendRow[i] = '';
  }
  setValueByHeader(appendRow, tokensMeta.headerMap, 'qr_token', qrToken);
  setValueByHeader(appendRow, tokensMeta.headerMap, 'course_id', normalizedCourseId);
  setValueByHeader(appendRow, tokensMeta.headerMap, 'session_id', normalizedSessionId);
  setValueByHeader(appendRow, tokensMeta.headerMap, 'created_at', now.toISOString());
  setValueByHeader(appendRow, tokensMeta.headerMap, 'expires_at', expiresAt.toISOString());
  setValueByHeader(appendRow, tokensMeta.headerMap, 'used', false);
  setValueByHeader(appendRow, tokensMeta.headerMap, 'meeting_key', meetingKey);
  setValueByHeader(appendRow, tokensMeta.headerMap, 'owner_identifier', normalizedOwnerIdentifier);
  tokensMeta.sheet.appendRow(appendRow);

  upsertSessionState({
    courseId: normalizedCourseId,
    sessionId: normalizedSessionId,
    meetingKey: meetingKey,
    ownerIdentifier: normalizedOwnerIdentifier,
    isStopped: false,
    eventTimeISO: nowISO(),
  });

  return {
    qr_token: qrToken,
    expires_at: expiresAt.toISOString(),
    meeting_key: meetingKey,
  };
}

function stopQrSession(body) {
  requireField(body, 'course_id');
  requireField(body, 'session_id');

  var normalizedCourseId = normalizeCourseId(body.course_id);
  var normalizedSessionId = normalizeSessionId(body.session_id);
  var normalizedMeetingKey = body.meeting_key
    ? normalizeMeetingKey(body.meeting_key)
    : '';
  var normalizedOwnerIdentifier = body.owner_identifier
    ? normalizeOwnerIdentifier(body.owner_identifier)
    : '';
  var stopTime = body.ts ? new Date(body.ts) : new Date();
  var stopTimeISO = isNaN(stopTime.getTime()) ? nowISO() : stopTime.toISOString();

  var state = upsertSessionState({
    courseId: normalizedCourseId,
    sessionId: normalizedSessionId,
    meetingKey: normalizedMeetingKey,
    ownerIdentifier: normalizedOwnerIdentifier,
    isStopped: true,
    eventTimeISO: stopTimeISO,
  });

  return {
    course_id: normalizedCourseId,
    session_id: normalizedSessionId,
    meeting_key: state.meeting_key,
    status: 'stopped',
    stopped_at: stopTimeISO,
  };
}

function checkin(body) {
  requireField(body, 'user_id');
  requireField(body, 'device_id');
  requireField(body, 'course_id');
  requireField(body, 'session_id');
  requireField(body, 'qr_token');

  var normalizedCourseId = normalizeCourseId(body.course_id);
  var normalizedSessionId = normalizeSessionId(body.session_id);
  var normalizedToken = normalizeToken(body.qr_token);
  var tokensMeta = getSheetMeta(SHEET.TOKENS);
  var tokensData = tokensMeta.sheet.getDataRange().getValues();
  var tokenFound = false;
  var tokenRowCourseId = '';
  var tokenRowSessionId = '';
  var tokenRowExpiresAt = null;
  var tokenRowMeetingKey = '';
  var checkTime = body.ts ? new Date(body.ts) : new Date();

  for (var i = tokensData.length - 1; i >= 1; i--) {
    var rowToken = normalizeToken(getValueByHeader(tokensData[i], tokensMeta.headerMap, 'qr_token'));
    var rowCourse = normalizeCourseId(getValueByHeader(tokensData[i], tokensMeta.headerMap, 'course_id'));
    var rowSession = normalizeSessionId(getValueByHeader(tokensData[i], tokensMeta.headerMap, 'session_id'));
    var rowExpiresAt = new Date(getValueByHeader(tokensData[i], tokensMeta.headerMap, 'expires_at'));
    var rowMeetingKey = normalizeMeetingKey(
      getValueByHeader(tokensData[i], tokensMeta.headerMap, 'meeting_key') || '',
    );

    if (rowToken === normalizedToken &&
        rowCourse === normalizedCourseId &&
        rowSession === normalizedSessionId) {
      tokenFound = true;
      tokenRowCourseId = rowCourse;
      tokenRowSessionId = rowSession;
      tokenRowExpiresAt = rowExpiresAt;
      tokenRowMeetingKey = rowMeetingKey;
      break;
    }
  }

  if (!tokenFound) {
    throw new Error('token_invalid');
  }

  var sessionState = getSessionState({
    meetingKey: tokenRowMeetingKey || null,
    courseId: tokenRowCourseId,
    sessionId: tokenRowSessionId,
  });
  if (sessionState) {
    if (sessionState.is_stopped) {
      throw new Error('session_closed');
    }
  } else if (tokenRowExpiresAt && checkTime > tokenRowExpiresAt) {
    throw new Error('token_expired');
  }

  var presenceMeta = getSheetMeta(SHEET.PRESENCE);
  var presenceData = presenceMeta.sheet.getDataRange().getValues();
  var normalizedUserId = String(body.user_id).trim();

  for (var j = presenceData.length - 1; j >= 1; j--) {
    var presenceUserId = String(getValueByHeader(presenceData[j], presenceMeta.headerMap, 'user_id')).trim();
    var presenceCourseId = normalizeCourseId(
      getValueByHeader(presenceData[j], presenceMeta.headerMap, 'course_id'),
    );

    if (presenceUserId !== normalizedUserId || presenceCourseId !== tokenRowCourseId) {
      continue;
    }

    if (tokenRowMeetingKey) {
      var presenceMeetingKey = normalizeMeetingKey(
        getValueByHeader(presenceData[j], presenceMeta.headerMap, 'meeting_key') || '',
      );
      if (presenceMeetingKey === tokenRowMeetingKey) {
        throw new Error('already_checked_in');
      }

      if (!presenceMeetingKey &&
          normalizeSessionId(getValueByHeader(presenceData[j], presenceMeta.headerMap, 'session_id')) === tokenRowSessionId) {
        throw new Error('already_checked_in');
      }
    } else if (normalizeSessionId(getValueByHeader(presenceData[j], presenceMeta.headerMap, 'session_id')) === tokenRowSessionId) {
      throw new Error('already_checked_in');
    }
  }

  var presenceId = shortId('PR-', 4);
  var appendRow = new Array(presenceMeta.columnCount);
  for (var rowIndex = 0; rowIndex < appendRow.length; rowIndex++) {
    appendRow[rowIndex] = '';
  }
  setValueByHeader(appendRow, presenceMeta.headerMap, 'presence_id', presenceId);
  setValueByHeader(appendRow, presenceMeta.headerMap, 'user_id', normalizedUserId);
  setValueByHeader(appendRow, presenceMeta.headerMap, 'device_id', String(body.device_id).trim());
  setValueByHeader(appendRow, presenceMeta.headerMap, 'course_id', tokenRowCourseId);
  setValueByHeader(appendRow, presenceMeta.headerMap, 'session_id', tokenRowSessionId);
  setValueByHeader(appendRow, presenceMeta.headerMap, 'qr_token', normalizedToken);
  setValueByHeader(appendRow, presenceMeta.headerMap, 'ts', checkTime.toISOString());
  setValueByHeader(appendRow, presenceMeta.headerMap, 'recorded_at', nowISO());
  setValueByHeader(appendRow, presenceMeta.headerMap, 'meeting_key', tokenRowMeetingKey);

  presenceMeta.sheet.appendRow(appendRow);

  return {
    presence_id: presenceId,
    status: 'checked_in',
  };
}

function getActiveSessions(ownerIdentifier, limit, courseId) {
  requireField({ owner_identifier: ownerIdentifier }, 'owner_identifier');

  var normalizedOwnerIdentifier = normalizeOwnerIdentifier(ownerIdentifier);
  var normalizedCourseId = courseId ? normalizeCourseId(courseId) : '';
  var maxItems = limit ? parseInt(limit, 10) : 20;
  if (isNaN(maxItems) || maxItems <= 0) {
    maxItems = 20;
  }

  var sessionMeta = getSheetMeta(SHEET.SESSION_STATE);
  var data = sessionMeta.sheet.getDataRange().getValues();
  var items = [];

  for (var i = 1; i < data.length; i++) {
    var rowOwnerIdentifier = normalizeOwnerIdentifier(
      getValueByHeader(data[i], sessionMeta.headerMap, 'owner_identifier') || '',
    );
    var rowCourseId = normalizeCourseId(
      getValueByHeader(data[i], sessionMeta.headerMap, 'course_id') || '',
    );
    var rowSessionId = normalizeSessionId(
      getValueByHeader(data[i], sessionMeta.headerMap, 'session_id') || '',
    );
    var rowMeetingKey = normalizeMeetingKey(
      getValueByHeader(data[i], sessionMeta.headerMap, 'meeting_key') || '',
    );
    var isStopped = getValueByHeader(data[i], sessionMeta.headerMap, 'is_stopped') === true ||
      String(getValueByHeader(data[i], sessionMeta.headerMap, 'is_stopped')).toLowerCase() === 'true';

    if (isStopped) {
      continue;
    }
    if (rowOwnerIdentifier !== normalizedOwnerIdentifier) {
      continue;
    }
    if (normalizedCourseId && rowCourseId !== normalizedCourseId) {
      continue;
    }

    items.push({
      course_id: rowCourseId,
      session_id: rowSessionId,
      meeting_key: rowMeetingKey || null,
      owner_identifier: rowOwnerIdentifier,
      status: 'active',
      started_at: getValueByHeader(data[i], sessionMeta.headerMap, 'started_at')
        ? String(getValueByHeader(data[i], sessionMeta.headerMap, 'started_at'))
        : null,
      updated_at: getValueByHeader(data[i], sessionMeta.headerMap, 'updated_at')
        ? String(getValueByHeader(data[i], sessionMeta.headerMap, 'updated_at'))
        : null,
    });
  }

  items.sort(function (a, b) {
    return Date.parse(b.updated_at || '') - Date.parse(a.updated_at || '');
  });

  return {
    owner_identifier: normalizedOwnerIdentifier,
    total: items.length,
    items: items.slice(0, maxItems),
  };
}

function getPresenceList(courseId, sessionId, limit) {
  if (!courseId) throw new Error('missing_field: course_id');
  if (!sessionId) throw new Error('missing_field: session_id');

  var normalizedCourseId = normalizeCourseId(courseId);
  var normalizedSessionId = normalizeSessionId(sessionId);
  var presenceMeta = getSheetMeta(SHEET.PRESENCE);
  var data = presenceMeta.sheet.getDataRange().getValues();

  var maxItems = limit ? parseInt(limit, 10) : 200;
  if (isNaN(maxItems) || maxItems <= 0) {
    maxItems = 200;
  }

  var total = 0;
  var items = [];

  for (var i = data.length - 1; i >= 1; i--) {
    if (normalizeCourseId(getValueByHeader(data[i], presenceMeta.headerMap, 'course_id')) !== normalizedCourseId ||
        normalizeSessionId(getValueByHeader(data[i], presenceMeta.headerMap, 'session_id')) !== normalizedSessionId) {
      continue;
    }

    total += 1;
    if (items.length >= maxItems) {
      continue;
    }

    items.push({
      presence_id: getValueByHeader(data[i], presenceMeta.headerMap, 'presence_id'),
      user_id: getValueByHeader(data[i], presenceMeta.headerMap, 'user_id'),
      device_id: getValueByHeader(data[i], presenceMeta.headerMap, 'device_id'),
      ts: getValueByHeader(data[i], presenceMeta.headerMap, 'ts'),
      recorded_at: getValueByHeader(data[i], presenceMeta.headerMap, 'recorded_at'),
    });
  }

  return {
    course_id: normalizedCourseId,
    session_id: normalizedSessionId,
    total: total,
    items: items,
  };
}

function getPresenceStatus(userId, courseId, sessionId) {
  if (!userId) throw new Error('missing_field: user_id');
  if (!courseId) throw new Error('missing_field: course_id');
  if (!sessionId) throw new Error('missing_field: session_id');

  var normalizedUserId = String(userId).trim();
  var normalizedCourseId = normalizeCourseId(courseId);
  var normalizedSessionId = normalizeSessionId(sessionId);
  var presenceMeta = getSheetMeta(SHEET.PRESENCE);
  var data = presenceMeta.sheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(getValueByHeader(data[i], presenceMeta.headerMap, 'user_id')).trim() === normalizedUserId &&
        normalizeCourseId(getValueByHeader(data[i], presenceMeta.headerMap, 'course_id')) === normalizedCourseId &&
        normalizeSessionId(getValueByHeader(data[i], presenceMeta.headerMap, 'session_id')) === normalizedSessionId) {
      return {
        user_id: normalizedUserId,
        course_id: normalizedCourseId,
        session_id: normalizedSessionId,
        status: 'checked_in',
        last_ts: getValueByHeader(data[i], presenceMeta.headerMap, 'ts'),
      };
    }
  }

  return {
    user_id: normalizedUserId,
    course_id: normalizedCourseId,
    session_id: normalizedSessionId,
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
