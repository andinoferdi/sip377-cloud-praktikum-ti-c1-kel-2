import type { AttendanceQrPayload } from "@/utils/home/attendance-types";

const LECTURER_ACTIVE_QR_KEY = "ctc_dosen_active_qr";

export type LecturerQrFormValues = {
  course_id: string;
  day: string;
  session_no: string;
  started_at: string;
};

type LecturerQrSessionState = {
  owner_identifier: string | null;
  active_payload: AttendanceQrPayload | null;
  next_rotation_at: string | null;
  is_stopped: boolean;
  form_values: LecturerQrFormValues;
  updated_at: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isValidQrPayload(payload: unknown): payload is AttendanceQrPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<AttendanceQrPayload>;
  return (
    candidate.v === 1 &&
    typeof candidate.course_id === "string" &&
    typeof candidate.session_id === "string" &&
    typeof candidate.qr_token === "string" &&
    typeof candidate.expires_at === "string" &&
    (candidate.meeting_key === undefined || typeof candidate.meeting_key === "string")
  );
}

function isValidFormValues(values: unknown): values is LecturerQrFormValues {
  if (!values || typeof values !== "object") {
    return false;
  }

  const candidate = values as Partial<LecturerQrFormValues>;
  return (
    typeof candidate.course_id === "string" &&
    typeof candidate.day === "string" &&
    typeof candidate.session_no === "string" &&
    typeof candidate.started_at === "string"
  );
}

export function readLecturerQrSessionState(ownerIdentifier: string | null) {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(LECTURER_ACTIVE_QR_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<LecturerQrSessionState>;
    const isStopped = parsed?.is_stopped === true;
    const hasValidPayload = parsed.active_payload
      ? isValidQrPayload(parsed.active_payload)
      : parsed.active_payload === null;
    if (
      !parsed ||
      (parsed.next_rotation_at !== null &&
        typeof parsed.next_rotation_at !== "string") ||
      typeof parsed.updated_at !== "string" ||
      !hasValidPayload ||
      !isValidFormValues(parsed.form_values)
    ) {
      return null;
    }

    if (
      ownerIdentifier &&
      parsed.owner_identifier &&
      parsed.owner_identifier !== ownerIdentifier
    ) {
      return null;
    }

    return {
      owner_identifier: parsed.owner_identifier ?? null,
      active_payload: parsed.active_payload ?? null,
      next_rotation_at: parsed.next_rotation_at ?? null,
      is_stopped: isStopped,
      form_values: parsed.form_values,
      updated_at: parsed.updated_at,
    } satisfies LecturerQrSessionState;
  } catch {
    return null;
  }
}

export function saveLecturerQrSessionState(params: {
  ownerIdentifier: string | null;
  activePayload: AttendanceQrPayload | null;
  nextRotationAt: string | null;
  isStopped: boolean;
  formValues: LecturerQrFormValues;
}) {
  if (!isBrowser()) {
    return;
  }

  const payload: LecturerQrSessionState = {
    owner_identifier: params.ownerIdentifier,
    active_payload: params.activePayload,
    next_rotation_at: params.nextRotationAt,
    is_stopped: params.isStopped,
    form_values: params.formValues,
    updated_at: new Date().toISOString(),
  };

  window.localStorage.setItem(LECTURER_ACTIVE_QR_KEY, JSON.stringify(payload));
}

export function clearLecturerQrSessionState() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(LECTURER_ACTIVE_QR_KEY);
}
