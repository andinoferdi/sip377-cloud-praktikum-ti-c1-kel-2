import {
  getPermissionsForRole,
  hasPermission,
  resolvePermissionsFromRoles,
} from "@/lib/auth/rbac";
import { describe, expect, it } from "vitest";

describe("rbac permission resolver", () => {
  it("gives full access for admin", () => {
    const permissions = getPermissionsForRole("admin");

    expect(permissions).toContain("dashboard_pos:read");
    expect(permissions).toContain("sales_approval:approve");
    expect(permissions).toContain("inventory:create");
    expect(permissions).toContain("user_role:delete");
  });

  it("keeps fnb without approval and purchase permissions", () => {
    const permissions = getPermissionsForRole("fnb");

    expect(permissions).toContain("sales:create");
    expect(permissions).toContain("sales:print");
    expect(permissions).not.toContain("sales:update");
    expect(permissions).not.toContain("sales_approval:approve");
    expect(permissions).not.toContain("purchase:create");
  });

  it("gives fnb manager stock and approval access with inventory read-only", () => {
    expect(hasPermission(["fnb_manager"], "sales_approval:approve")).toBe(true);
    expect(hasPermission(["fnb_manager"], "stock_management:update")).toBe(true);
    expect(hasPermission(["fnb_manager"], "inventory:read")).toBe(true);
    expect(hasPermission(["fnb_manager"], "inventory:update")).toBe(false);
    expect(hasPermission(["fnb_manager"], "inventory:export")).toBe(false);
    expect(hasPermission(["fnb_manager"], "category:export")).toBe(false);
  });

  it("keeps host in sales operational scope", () => {
    const permissions = getPermissionsForRole("host");

    expect(permissions).toContain("dashboard_pos:read");
    expect(permissions).toContain("sales:create");
    expect(permissions).toContain("sales:read");
    expect(permissions).toContain("sales:print");
    expect(permissions).not.toContain("sales:update");
    expect(permissions).not.toContain("purchase:read");
  });

  it("uses union of permissions for multi-role assignment", () => {
    const permissions = resolvePermissionsFromRoles(["host", "fnb_manager"]);

    expect(permissions).toContain("sales_approval:approve");
    expect(permissions).toContain("sales:print");
    expect(permissions).toContain("purchase:create");
  });
});
