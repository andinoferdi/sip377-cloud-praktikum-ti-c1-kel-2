import type { AttendanceQrPayload } from "@/utils/home/attendance-types";

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
    : `${startedAtDate.getUTCFullYear()}${pad(startedAtDate.getUTCMonth() + 1)}${pad(startedAtDate.getUTCDate())}${pad(startedAtDate.getUTCHours())}${pad(startedAtDate.getUTCMinutes())}`;

  return `${params.courseId}-${params.day}-${params.sessionNo}-${datePart}`;
}

export function serializeAttendanceQrPayload(payload: AttendanceQrPayload) {
  return JSON.stringify(payload);
}

export function parseAttendanceQrPayload(rawValue: string): AttendanceQrPayload | null {
  try {
    const parsedValue = JSON.parse(rawValue) as Partial<AttendanceQrPayload>;
    if (
      parsedValue?.v !== 1 ||
      typeof parsedValue.course_id !== "string" ||
      typeof parsedValue.session_id !== "string" ||
      typeof parsedValue.qr_token !== "string" ||
      typeof parsedValue.expires_at !== "string"
    ) {
      return null;
    }

    return {
      v: 1,
      course_id: parsedValue.course_id,
      session_id: parsedValue.session_id,
      qr_token: parsedValue.qr_token,
      expires_at: parsedValue.expires_at,
    };
  } catch {
    return null;
  }
}
