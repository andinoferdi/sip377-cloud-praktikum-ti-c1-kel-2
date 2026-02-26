export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type GenerateQrRequest = {
  course_id: string;
  session_id: string;
  ts: string;
};

export type GenerateQrData = {
  qr_token: string;
  expires_at: string;
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

export type StatusRequest = {
  user_id: string;
  course_id: string;
  session_id: string;
};

export type StatusData = {
  user_id: string;
  course_id: string;
  session_id: string;
  status: "checked_in" | "not_checked_in";
  last_ts: string | null;
};
