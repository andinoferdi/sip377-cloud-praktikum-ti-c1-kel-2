export type LecturerActiveQrPayload = {
  course_id: string;
  session_id: string;
  qr_token: string;
  expires_at: string;
  meeting_key?: string | null;
};

export function parseLecturerActiveQrState(rawValue: string | null) {
  if (!rawValue) {
    throw new Error("ctc_dosen_active_qr is empty.");
  }

  const parsed = JSON.parse(rawValue) as {
    active_payload?: Partial<LecturerActiveQrPayload>;
  };

  if (!parsed.active_payload) {
    throw new Error("ctc_dosen_active_qr.active_payload is missing.");
  }

  const payload = parsed.active_payload;
  const requiredFields: Array<keyof LecturerActiveQrPayload> = [
    "course_id",
    "session_id",
    "qr_token",
    "expires_at",
  ];

  for (const field of requiredFields) {
    if (typeof payload[field] !== "string" || !payload[field]) {
      throw new Error(`Invalid active_payload.${field}.`);
    }
  }

  return {
    course_id: payload.course_id as string,
    session_id: payload.session_id as string,
    qr_token: payload.qr_token as string,
    expires_at: payload.expires_at as string,
    meeting_key:
      typeof payload.meeting_key === "string" ? payload.meeting_key : null,
  } satisfies LecturerActiveQrPayload;
}
