import type { AttendanceQrPayload } from "@/utils/home/attendance-types";

const QR_COMPACT_PREFIX = "CTC1";
const QR_COMPACT_SEPARATOR = "|";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function buildAttendanceSessionId(params: {
  courseId: string;
  day: string;
  sessionNo: string;
  startedAt: string;
}) {
  const startedAtDate = new Date(params.startedAt);
  const datePart = Number.isNaN(startedAtDate.getTime())
    ? "invalid"
    : `${startedAtDate.getFullYear()}${pad(startedAtDate.getMonth() + 1)}${pad(startedAtDate.getDate())}${pad(startedAtDate.getHours())}${pad(startedAtDate.getMinutes())}`;

  return `${params.courseId}-${params.day}-${params.sessionNo}-${datePart}`;
}

function isValidTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function parseLegacyAttendanceQrPayload(rawValue: string): AttendanceQrPayload | null {
  try {
    const parsedValue = JSON.parse(rawValue) as Partial<AttendanceQrPayload>;
    if (
      parsedValue?.v !== 1 ||
      typeof parsedValue.course_id !== "string" ||
      typeof parsedValue.session_id !== "string" ||
      typeof parsedValue.qr_token !== "string" ||
      typeof parsedValue.expires_at !== "string" ||
      !isValidTimestamp(parsedValue.expires_at)
    ) {
      return null;
    }

    return {
      v: 1,
      course_id: parsedValue.course_id,
      session_id: parsedValue.session_id,
      qr_token: parsedValue.qr_token,
      expires_at: parsedValue.expires_at,
      meeting_key:
        typeof parsedValue.meeting_key === "string" ? parsedValue.meeting_key : undefined,
    };
  } catch {
    return null;
  }
}

function parseCompactAttendanceQrPayload(rawValue: string): AttendanceQrPayload | null {
  if (!rawValue.startsWith(`${QR_COMPACT_PREFIX}${QR_COMPACT_SEPARATOR}`)) {
    return null;
  }

  const segments = rawValue.split(QR_COMPACT_SEPARATOR);
  if (segments.length !== 5 && segments.length !== 6) {
    return null;
  }

  const [
    ,
    encodedCourseId,
    encodedSessionId,
    qrToken,
    encodedExpiresAt,
    encodedMeetingKey,
  ] = segments;

  let courseId = "";
  let sessionId = "";
  let expiresAt = "";
  let meetingKey: string | undefined;

  try {
    courseId = decodeURIComponent(encodedCourseId);
    sessionId = decodeURIComponent(encodedSessionId);
    expiresAt = decodeURIComponent(encodedExpiresAt);
    meetingKey = encodedMeetingKey ? decodeURIComponent(encodedMeetingKey) : undefined;
  } catch {
    return null;
  }

  if (!courseId || !sessionId || !qrToken || !expiresAt || !isValidTimestamp(expiresAt)) {
    return null;
  }

  return {
    v: 1,
    course_id: courseId,
    session_id: sessionId,
    qr_token: qrToken,
    expires_at: expiresAt,
    meeting_key: meetingKey,
  };
}

export function serializeAttendanceQrPayload(payload: AttendanceQrPayload) {
  const encoded = [
    QR_COMPACT_PREFIX,
    encodeURIComponent(payload.course_id),
    encodeURIComponent(payload.session_id),
    payload.qr_token,
    encodeURIComponent(payload.expires_at),
  ];

  if (payload.meeting_key) {
    encoded.push(encodeURIComponent(payload.meeting_key));
  }

  return encoded.join(QR_COMPACT_SEPARATOR);
}

export function isExpiredTimestamp(expiresAt: string) {
  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) {
    return true;
  }
  return Date.now() >= expiresAtMs;
}

export function parseAttendanceQrPayload(rawValue: string): AttendanceQrPayload | null {
  return (
    parseCompactAttendanceQrPayload(rawValue) ??
    parseLegacyAttendanceQrPayload(rawValue)
  );
}
