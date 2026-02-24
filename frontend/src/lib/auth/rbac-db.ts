import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { PermissionKey, RoleCode } from "@/types/rbac";

type UserAccessSnapshot = {
  roleCode: RoleCode | null;
  permissions: PermissionKey[];
};

export const resolveUserAccessFromDb = async (
  userId: string
): Promise<UserAccessSnapshot> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: {
                select: {
                  permissionKey: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.role) {
    return {
      roleCode: null,
      permissions: [],
    };
  }

  const permissions = user.role.rolePermissions
    .map((rp: { permission: { permissionKey: string } }) => rp.permission.permissionKey as PermissionKey)
    .sort();

  return {
    roleCode: user.role.code as RoleCode,
    permissions,
  };
};
