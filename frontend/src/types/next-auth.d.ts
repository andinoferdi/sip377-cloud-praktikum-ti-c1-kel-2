import type { PermissionKey, RoleCode } from "@/types/rbac";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      roleCode: RoleCode | null;
      permissions: PermissionKey[];
    };
  }

  interface User {
    id: string;
    roleCode?: RoleCode | null;
    permissions?: PermissionKey[];
    accessSyncedAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleCode?: RoleCode | null;
    permissions?: PermissionKey[];
    accessSyncedAt?: number;
  }
}
