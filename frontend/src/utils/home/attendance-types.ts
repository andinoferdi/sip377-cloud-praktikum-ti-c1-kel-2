export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type AttendanceQrPayload = {
  v: 1;
  course_id: string;
  session_id: string;
  qr_token: string;
  expires_at: string;
  meeting_key?: string;
};

export type AttendanceQrRequest = {
  course_id: string;
  session_id: string;
  ts: string;
  owner_identifier?: string;
  meeting_key?: string;
};

export type AttendanceQrData = {
  qr_token: string;
  expires_at: string;
  meeting_key: string;
};

export type StopSessionRequest = {
  course_id: string;
  session_id: string;
  ts: string;
  owner_identifier?: string;
  meeting_key?: string;
};

export type StopSessionData = {
  course_id: string;
  session_id: string;
  meeting_key?: string | null;
  status: "stopped";
  stopped_at: string;
};

export type CheckInRequest = {
  user_id: string;
  device_id: string;
  course_id: string;
  session_id: string;
  qr_token: string;
  ts: string;
};

export type CheckInData = {
  presence_id: string;
  status: "checked_in";
};

export type AttendanceStatusRequest = {
  user_id: string;
  course_id: string;
  session_id: string;
};

export type AttendanceStatusData = {
  user_id: string;
  course_id: string;
  session_id: string;
  status: "checked_in" | "not_checked_in";
  last_ts: string | null;
};

export type AttendanceListRequest = {
  course_id: string;
  session_id: string;
  limit?: number;
};

export type AttendanceListItem = {
  presence_id: string;
  user_id: string;
  device_id: string;
  ts: string;
  recorded_at: string;
};

export type AttendanceListData = {
  course_id: string;
  session_id: string;
  total: number;
  items: AttendanceListItem[];
};

export type ActiveSessionsRequest = {
  owner_identifier: string;
  limit?: number;
  course_id?: string;
};

export type ActiveSessionItem = {
  course_id: string;
  session_id: string;
  meeting_key: string | null;
  owner_identifier: string;
  status: "active";
  started_at: string | null;
  updated_at: string | null;
};

export type ActiveSessionsData = {
  owner_identifier: string;
  total: number;
  items: ActiveSessionItem[];
};
