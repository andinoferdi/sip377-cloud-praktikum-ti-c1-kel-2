import type { CheckInData } from "@/utils/home/attendance-types";

const HISTORY_KEY = "ctc_presence_history";

export type AttendanceHistoryItem = {
  user_id: string;
  course_id: string;
  session_id: string;
  qr_token: string;
  ts: string;
  result: CheckInData["status"];
  presence_id: string;
};

export function readAttendanceHistory() {
  if (typeof window === "undefined") {
    return [] as AttendanceHistoryItem[];
  }

  const rawValue = window.localStorage.getItem(HISTORY_KEY);
  if (!rawValue) {
    return [] as AttendanceHistoryItem[];
  }

  try {
    const parsed = JSON.parse(rawValue) as AttendanceHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAttendanceHistory(item: AttendanceHistoryItem) {
  if (typeof window === "undefined") {
    return;
  }

  const previousItems = readAttendanceHistory();
  const nextItems = [item, ...previousItems].slice(0, 50);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextItems));
}
