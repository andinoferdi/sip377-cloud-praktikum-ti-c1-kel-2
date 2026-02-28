import { describe, expect, it } from "vitest";
import {
  formatRemainingSeconds,
  getNextRefreshAt,
  getRemainingMs,
  isTokenExpired,
} from "@/lib/home/attendance-token-timing";

describe("attendance-token-timing", () => {
  it("detects expired token", () => {
    expect(isTokenExpired("2026-02-26T10:00:00.000Z", Date.parse("2026-02-26T10:00:01.000Z"))).toBe(true);
    expect(isTokenExpired("2026-02-26T10:00:00.000Z", Date.parse("2026-02-26T09:59:59.000Z"))).toBe(false);
  });

  it("returns zero remaining ms when already expired", () => {
    expect(getRemainingMs("2026-02-26T10:00:00.000Z", Date.parse("2026-02-26T10:00:01.000Z"))).toBe(0);
  });

  it("returns refresh timestamp only when auto refresh enabled", () => {
    const expiry = "2026-02-26T10:02:00.000Z";
    expect(getNextRefreshAt(expiry, true)).toBe(expiry);
    expect(getNextRefreshAt(expiry, false)).toBeNull();
  });

  it("formats remaining seconds with ceil rounding", () => {
    const now = Date.parse("2026-02-26T10:00:00.000Z");
    const expiry = "2026-02-26T10:00:10.100Z";
    expect(formatRemainingSeconds(expiry, now)).toBe(11);
  });
});
