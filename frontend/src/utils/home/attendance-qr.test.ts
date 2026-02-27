import { describe, expect, it } from "vitest";
import {
  buildAttendanceSessionId,
  parseAttendanceQrPayload,
  serializeAttendanceQrPayload,
} from "@/utils/home/attendance-qr";

describe("attendance-qr-utils", () => {
  it("builds stable session id format", () => {
    const sessionId = buildAttendanceSessionId({
      courseId: "cloud-101",
      day: "senin",
      sessionNo: "02",
      startedAt: "2026-02-27T10:15:00.000Z",
    });

    expect(sessionId).toBe("cloud-101-senin-02-202602271015");
  });

  it("serializes and parses qr payload", () => {
    const rawValue = serializeAttendanceQrPayload({
      v: 1,
      course_id: "cloud-101",
      session_id: "cloud-101-senin-02-202602271015",
      qr_token: "TKN-123ABC",
      expires_at: "2026-02-27T10:16:30.000Z",
    });

    const parsed = parseAttendanceQrPayload(rawValue);

    expect(parsed).toEqual({
      v: 1,
      course_id: "cloud-101",
      session_id: "cloud-101-senin-02-202602271015",
      qr_token: "TKN-123ABC",
      expires_at: "2026-02-27T10:16:30.000Z",
    });
  });
});
