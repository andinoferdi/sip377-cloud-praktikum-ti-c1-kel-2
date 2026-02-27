import { describe, expect, it } from "vitest";
import { createAttendanceSimulationEngine } from "@/lib/home/mock-attendance-engine";

describe("mock-attendance-engine", () => {
  it("marks token as used after first check-in", () => {
    const engine = createAttendanceSimulationEngine();
    const generated = engine.generateToken({
      course_id: "cloud-101",
      session_id: "sesi-02",
      ts: "2026-02-27T10:00:00.000Z",
    });

    if (!generated.ok) {
      throw new Error("expected token generation to succeed");
    }

    const firstCheckin = engine.checkIn({
      user_id: "2023xxxx",
      device_id: "dev-001",
      course_id: "cloud-101",
      session_id: "sesi-02",
      qr_token: generated.data.qr_token,
      ts: "2026-02-27T10:00:30.000Z",
    });
    const secondCheckin = engine.checkIn({
      user_id: "2023yyyy",
      device_id: "dev-002",
      course_id: "cloud-101",
      session_id: "sesi-02",
      qr_token: generated.data.qr_token,
      ts: "2026-02-27T10:00:40.000Z",
    });

    expect(firstCheckin).toMatchObject({ ok: true });
    expect(secondCheckin).toEqual({ ok: false, error: "token_already_used" });
  });

  it("returns token_invalid when token context does not match", () => {
    const engine = createAttendanceSimulationEngine();
    const generated = engine.generateToken({
      course_id: "cloud-101",
      session_id: "sesi-02",
      ts: "2026-02-27T10:00:00.000Z",
    });

    if (!generated.ok) {
      throw new Error("expected token generation to succeed");
    }

    const checkin = engine.checkIn({
      user_id: "2023xxxx",
      device_id: "dev-001",
      course_id: "cloud-202",
      session_id: "sesi-02",
      qr_token: generated.data.qr_token,
      ts: "2026-02-27T10:00:30.000Z",
    });

    expect(checkin).toEqual({ ok: false, error: "token_invalid" });
  });
});
