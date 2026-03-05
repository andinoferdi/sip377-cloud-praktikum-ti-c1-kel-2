import { requestGas } from "@/services/gas-client";
import type {
  ActiveSessionsData,
  ActiveSessionsRequest,
  ApiResponse,
  AttendanceListData,
  AttendanceListRequest,
  AttendanceQrData,
  AttendanceQrRequest,
  AttendanceStatusData,
  AttendanceStatusRequest,
  CheckInData,
  CheckInRequest,
  CourseMeetingConfigData,
  CourseMeetingConfigRequest,
  CourseMeetingConfigUpsertData,
  CourseMeetingConfigUpsertRequest,
  StopSessionData,
  StopSessionRequest,
} from "@/utils/home/attendance-types";

const ATTENDANCE_API_PATHS = {
  generate: "/presence/qr/generate",
  stopSession: "/presence/qr/stop",
  checkIn: "/presence/checkin",
  status: "/presence/status",
  list: "/presence/list",
  activeSessions: "/presence/sessions/active",
  courseConfig: "/presence/course/config",
} as const;

export const attendanceGasService = {
  generateToken(payload: AttendanceQrRequest) {
    return requestGas<ApiResponse<AttendanceQrData>>(ATTENDANCE_API_PATHS.generate, {
      method: "POST",
      json: payload,
    });
  },

  stopSession(payload: StopSessionRequest) {
    return requestGas<ApiResponse<StopSessionData>>(ATTENDANCE_API_PATHS.stopSession, {
      method: "POST",
      json: payload,
    });
  },

  checkIn(payload: CheckInRequest) {
    return requestGas<ApiResponse<CheckInData>>(ATTENDANCE_API_PATHS.checkIn, {
      method: "POST",
      json: payload,
    });
  },

  checkStatus(params: AttendanceStatusRequest) {
    return requestGas<ApiResponse<AttendanceStatusData>>(ATTENDANCE_API_PATHS.status, {
      method: "GET",
      query: params,
    });
  },

  listAttendanceBySession(params: AttendanceListRequest) {
    return requestGas<ApiResponse<AttendanceListData>>(ATTENDANCE_API_PATHS.list, {
      method: "GET",
      query: params,
    });
  },

  listActiveSessions(params: ActiveSessionsRequest) {
    return requestGas<ApiResponse<ActiveSessionsData>>(
      ATTENDANCE_API_PATHS.activeSessions,
      {
        method: "GET",
        query: params,
      },
    );
  },

  getCourseMeetingConfig(params: CourseMeetingConfigRequest) {
    return requestGas<ApiResponse<CourseMeetingConfigData>>(
      ATTENDANCE_API_PATHS.courseConfig,
      {
        method: "GET",
        query: params,
      },
    );
  },

  setCourseMeetingConfig(payload: CourseMeetingConfigUpsertRequest) {
    return requestGas<ApiResponse<CourseMeetingConfigUpsertData>>(
      ATTENDANCE_API_PATHS.courseConfig,
      {
        method: "POST",
        json: payload,
      },
    );
  },
};
