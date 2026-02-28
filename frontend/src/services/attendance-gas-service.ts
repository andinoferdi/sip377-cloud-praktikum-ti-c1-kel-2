import { requestGas } from "@/services/gas-client";
import type {
  ApiResponse,
  AttendanceListData,
  AttendanceListRequest,
  AttendanceQrData,
  AttendanceQrRequest,
  AttendanceStatusData,
  AttendanceStatusRequest,
  CheckInData,
  CheckInRequest,
  StopSessionData,
  StopSessionRequest,
} from "@/utils/home/attendance-types";

const ATTENDANCE_API_PATHS = {
  generate: "/presence/qr/generate",
  stopSession: "/presence/qr/stop",
  checkIn: "/presence/checkin",
  status: "/presence/status",
  list: "/presence/list",
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
};
