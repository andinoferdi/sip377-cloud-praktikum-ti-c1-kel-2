export const ROLE_CODES = ["admin", "fnb", "fnb_manager", "host"] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

export const PERMISSION_ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "approve",
  "print",
  "export",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_MODULES = [
  "dashboard_pos",
  "sales",
  "sales_approval",
  "purchase",
  "stock_management",
  "inventory",
  "category",
  "reports",
  "user_role",
  "settings",
  "pos_instance",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export type PermissionKey = `${PermissionModule}:${PermissionAction}`;

export type PermissionMatrixRow = {
  module: PermissionModule;
  actions: Partial<Record<PermissionAction, RoleCode[]>>;
};
