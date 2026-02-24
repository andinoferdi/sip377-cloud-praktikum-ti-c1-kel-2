import type {
  PermissionAction,
  PermissionKey,
  PermissionMatrixRow,
  PermissionModule,
  RoleCode,
} from "@/types/rbac";

export const POS_PERMISSION_MATRIX: PermissionMatrixRow[] = [
  {
    module: "dashboard_pos",
    actions: {
      read: ["admin", "fnb", "fnb_manager", "host"],
    },
  },
  {
    module: "sales",
    actions: {
      create: ["admin", "fnb", "fnb_manager", "host"],
      read: ["admin", "fnb", "fnb_manager", "host"],
      update: ["admin", "fnb_manager"],
      delete: ["admin", "fnb_manager"],
      print: ["admin", "fnb", "fnb_manager", "host"],
      export: ["admin", "fnb_manager"],
    },
  },
  {
    module: "sales_approval",
    actions: {
      read: ["admin", "fnb_manager"],
      approve: ["admin", "fnb_manager"],
    },
  },
  {
    module: "purchase",
    actions: {
      create: ["admin", "fnb_manager"],
      read: ["admin", "fnb_manager"],
      update: ["admin", "fnb_manager"],
      delete: ["admin", "fnb_manager"],
      approve: ["admin", "fnb_manager"],
      print: ["admin", "fnb_manager"],
      export: ["admin", "fnb_manager"],
    },
  },
  {
    module: "stock_management",
    actions: {
      create: ["admin", "fnb_manager"],
      read: ["admin", "fnb_manager"],
      update: ["admin", "fnb_manager"],
      delete: ["admin", "fnb_manager"],
      export: ["admin", "fnb_manager"],
    },
  },
  {
    module: "inventory",
    actions: {
      create: ["admin"],
      read: ["admin", "fnb_manager"],
      update: ["admin"],
      delete: ["admin"],
      export: ["admin"],
    },
  },
  {
    module: "category",
    actions: {
      create: ["admin"],
      read: ["admin", "fnb_manager"],
      update: ["admin"],
      delete: ["admin"],
      export: ["admin"],
    },
  },
  {
    module: "reports",
    actions: {
      read: ["admin", "fnb_manager"],
      print: ["admin", "fnb_manager"],
      export: ["admin", "fnb_manager"],
    },
  },
  {
    module: "user_role",
    actions: {
      create: ["admin"],
      read: ["admin"],
      update: ["admin"],
      delete: ["admin"],
      export: ["admin"],
    },
  },
  {
    module: "settings",
    actions: {
      create: ["admin"],
      read: ["admin"],
      update: ["admin"],
      delete: ["admin"],
      export: ["admin"],
    },
  },
];

const createPermissionKey = (
  moduleName: PermissionModule,
  actionName: PermissionAction
): PermissionKey => `${moduleName}:${actionName}`;

const buildRolePermissionIndex = () => {
  const index: Record<RoleCode, Set<PermissionKey>> = {
    admin: new Set<PermissionKey>(),
    fnb: new Set<PermissionKey>(),
    fnb_manager: new Set<PermissionKey>(),
    host: new Set<PermissionKey>(),
  };

  for (const row of POS_PERMISSION_MATRIX) {
    for (const [actionName, roleCodes] of Object.entries(row.actions) as Array<
      [PermissionAction, RoleCode[]]
    >) {
      const key = createPermissionKey(row.module, actionName);
      for (const roleCode of roleCodes) {
        index[roleCode].add(key);
      }
    }
  }

  return index;
};

const rolePermissionIndex = buildRolePermissionIndex();

export const getPermissionsForRole = (roleCode: RoleCode): PermissionKey[] => {
  return Array.from(rolePermissionIndex[roleCode] ?? []).sort();
};

export const hasRole = (
  roleCode: RoleCode | null,
  requiredRoles: RoleCode[]
): boolean => {
  if (!roleCode) return false;
  return requiredRoles.includes(roleCode);
};

export const hasPermission = (
  roleCode: RoleCode | RoleCode[] | null,
  permissionKey: PermissionKey
): boolean => {
  if (!roleCode) return false;

  if (Array.isArray(roleCode)) {
    return resolvePermissionsFromRoles(roleCode).includes(permissionKey);
  }

  return getPermissionsForRole(roleCode).includes(permissionKey);
};

export const resolvePermissionsFromRoles = (
  roleCodes: RoleCode[]
): PermissionKey[] => {
  const allPermissions = new Set<PermissionKey>();
  for (const roleCode of roleCodes) {
    const permissions = getPermissionsForRole(roleCode);
    for (const permission of permissions) {
      allPermissions.add(permission);
    }
  }
  return Array.from(allPermissions).sort();
};
