import { getPosEntryRoute } from "@/features/portal/utils/pos-entry-route";
import { describe, expect, it } from "vitest";

describe("getPosEntryRoute", () => {
  it("routes fnb to sales create", () => {
    expect(getPosEntryRoute("fnb", "pos-1")).toBe("/pos-1/dashboard/pos/sales/create");
  });

  it("routes fnb_manager to sales list", () => {
    expect(getPosEntryRoute("fnb_manager", "pos-1")).toBe("/pos-1/dashboard/pos/sales");
  });

  it("routes host to sales list", () => {
    expect(getPosEntryRoute("host", "pos-1")).toBe("/pos-1/dashboard/pos/sales");
  });

  it("routes admin to contextual dashboard home", () => {
    expect(getPosEntryRoute("admin", "pos-1")).toBe("/pos-1/dashboard");
  });
});
