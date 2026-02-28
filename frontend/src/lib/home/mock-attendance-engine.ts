import type {
  ApiResponse,
  AttendanceQrData,
  AttendanceQrRequest,
  AttendanceStatusData,
  AttendanceStatusRequest,
  CheckInData,
  CheckInRequest,
} from "@/utils/home/attendance-types";

type ActiveToken = {
  course_id: string;
  session_id: string;
  expires_at: string;
  used: boolean;
};

type PresenceRecord = {
  presence_id: string;
  user_id: string;
  course_id: string;
  session_id: string;
  status: "checked_in";
  last_ts: string;
};

const TOKEN_TTL_MS = 2 * 60 * 1000;

function hasValidTimestamp(value: string) {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

function findMissingField(fields: Array<[string, string]>) {
  const missingField = fields.find(([, value]) => value.trim().length === 0);
  return missingField ? missingField[0] : null;
}

function toPresenceKey(
  userId: string,
  courseId: string,
  sessionId: string,
) {
  return `${userId}::${courseId}::${sessionId}`;
}

function generateTokenCode() {
  return `TKN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function formatPresenceId(sequence: number) {
  return `PR-${String(sequence).padStart(4, "0")}`;
}

export type AttendanceSimulationEngine = {
  generateToken: (request: AttendanceQrRequest) => ApiResponse<AttendanceQrData>;
  checkIn: (request: CheckInRequest) => ApiResponse<CheckInData>;
  checkStatus: (request: AttendanceStatusRequest) => ApiResponse<AttendanceStatusData>;
};

export function createAttendanceSimulationEngine(): AttendanceSimulationEngine {
  const activeTokens = new Map<string, ActiveToken>();
  const presenceRecords = new Map<string, PresenceRecord>();
  let sequence = 1;

  const generateToken = (
    request: AttendanceQrRequest,
  ): ApiResponse<AttendanceQrData> => {
    const missingField = findMissingField([
      ["course_id", request.course_id],
      ["session_id", request.session_id],
      ["ts", request.ts],
    ]);

    if (missingField) {
      return { ok: false, error: `missing_field: ${missingField}` };
    }

    if (!hasValidTimestamp(request.ts)) {
      return { ok: false, error: "invalid_ts" };
    }

    const now = new Date(request.ts);
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS).toISOString();
    const token = generateTokenCode();

    activeTokens.set(token, {
      course_id: request.course_id,
      session_id: request.session_id,
      expires_at: expiresAt,
      used: false,
    });

    return {
      ok: true,
      data: {
        qr_token: token,
        expires_at: expiresAt,
      },
    };
  };

  const checkIn = (request: CheckInRequest): ApiResponse<CheckInData> => {
    const missingField = findMissingField([
      ["user_id", request.user_id],
      ["device_id", request.device_id],
      ["course_id", request.course_id],
      ["session_id", request.session_id],
      ["qr_token", request.qr_token],
      ["ts", request.ts],
    ]);

    if (missingField) {
      return { ok: false, error: `missing_field: ${missingField}` };
    }

    if (!hasValidTimestamp(request.ts)) {
      return { ok: false, error: "invalid_ts" };
    }

    const token = activeTokens.get(request.qr_token);
    if (!token) {
      return { ok: false, error: "token_invalid" };
    }

    if (
      token.course_id !== request.course_id ||
      token.session_id !== request.session_id
    ) {
      return { ok: false, error: "token_invalid" };
    }

    if (new Date(request.ts).getTime() > new Date(token.expires_at).getTime()) {
      return { ok: false, error: "token_expired" };
    }

    if (token.used) {
      return { ok: false, error: "token_already_used" };
    }
    token.used = true;

    const key = toPresenceKey(
      request.user_id,
      request.course_id,
      request.session_id,
    );
    const existingRecord = presenceRecords.get(key);
    const presenceId = existingRecord
      ? existingRecord.presence_id
      : formatPresenceId(sequence++);

    presenceRecords.set(key, {
      presence_id: presenceId,
      user_id: request.user_id,
      course_id: request.course_id,
      session_id: request.session_id,
      status: "checked_in",
      last_ts: request.ts,
    });

    return {
      ok: true,
      data: {
        presence_id: presenceId,
        status: "checked_in",
      },
    };
  };

  const checkStatus = (
    request: AttendanceStatusRequest,
  ): ApiResponse<AttendanceStatusData> => {
    const missingField = findMissingField([
      ["user_id", request.user_id],
      ["course_id", request.course_id],
      ["session_id", request.session_id],
    ]);

    if (missingField) {
      return { ok: false, error: `missing_field: ${missingField}` };
    }

    const key = toPresenceKey(
      request.user_id,
      request.course_id,
      request.session_id,
    );
    const record = presenceRecords.get(key);

    if (!record) {
      return {
        ok: true,
        data: {
          user_id: request.user_id,
          course_id: request.course_id,
          session_id: request.session_id,
          status: "not_checked_in",
          last_ts: null,
        },
      };
    }

    return {
      ok: true,
      data: {
        user_id: record.user_id,
        course_id: record.course_id,
        session_id: record.session_id,
        status: record.status,
        last_ts: record.last_ts,
      },
    };
  };

  return {
    generateToken,
    checkIn,
    checkStatus,
  };
}
