import {
  extractPosInstanceIdFromPath,
  normalizeContextualDashboardPath,
  replacePosInDashboardPath,
  withDashboardBase,
  withPosDashboardBase,
} from "@/lib/utils/dashboard-routes";
import { describe, expect, it } from "vitest";

describe("dashboard routes helpers", () => {
  it("builds dashboard path", () => {
    expect(withDashboardBase("/")).toBe("/dashboard");
    expect(withDashboardBase("/pos/sales")).toBe("/dashboard/pos/sales");
  });

  it("builds contextual dashboard path", () => {
    expect(withPosDashboardBase("uuid-1", "/")).toBe("/uuid-1/dashboard");
    expect(withPosDashboardBase("uuid-1", "/pos/sales")).toBe("/uuid-1/dashboard/pos/sales");
  });

  it("extracts pos instance id from contextual path", () => {
    expect(extractPosInstanceIdFromPath("/uuid-1/dashboard")).toBe("uuid-1");
    expect(extractPosInstanceIdFromPath("/uuid-1/dashboard/pos/sales")).toBe("uuid-1");
    expect(extractPosInstanceIdFromPath("/dashboard")).toBeNull();
  });

  it("normalizes contextual dashboard path", () => {
    expect(normalizeContextualDashboardPath("/uuid-1/dashboard")).toBe("/dashboard");
    expect(normalizeContextualDashboardPath("/uuid-1/dashboard/pos/sales")).toBe("/dashboard/pos/sales");
    expect(normalizeContextualDashboardPath("/portal")).toBe("/portal");
  });

  it("replaces pos id while preserving suffix path", () => {
    expect(replacePosInDashboardPath("/uuid-1/dashboard/pos/sales", "uuid-2")).toBe(
      "/uuid-2/dashboard/pos/sales"
    );
    expect(replacePosInDashboardPath("/dashboard", "uuid-2")).toBe("/uuid-2/dashboard");
  });
});
