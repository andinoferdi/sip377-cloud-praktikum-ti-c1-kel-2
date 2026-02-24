import { auth } from "@/auth";
import { hasRole, hasPermission } from "@/lib/auth/rbac";
import type { PermissionKey, RoleCode } from "@/types/rbac";
import { NextResponse } from "next/server";

export type GuardResult = {
  response: NextResponse | null;
};

const buildUnauthorizedResponse = () => {
  return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
};

const buildForbiddenResponse = (
  requiredPermission: PermissionKey | RoleCode[],
  roleCode: RoleCode | null
) => {
  return NextResponse.json(
    {
      message: "Forbidden",
      required_permission: requiredPermission,
      role: roleCode,
    },
    { status: 403 }
  );
};

export const requirePermission = async (
  permissionKey: PermissionKey
): Promise<GuardResult> => {
  const session = await auth();

  if (!session?.user?.id) {
    return { response: buildUnauthorizedResponse() };
  }

  const roleCode = session.user.roleCode ?? null;
  const permissions = session.user.permissions ?? [];
  const canAccess =
    permissions.length > 0
      ? permissions.includes(permissionKey)
      : hasPermission(roleCode, permissionKey);

  if (!canAccess) {
    return {
      response: buildForbiddenResponse(permissionKey, roleCode),
    };
  }

  return { response: null };
};

export const requireAnyRole = async (
  allowedRoles: RoleCode[]
): Promise<GuardResult> => {
  const session = await auth();

  if (!session?.user?.id) {
    return { response: buildUnauthorizedResponse() };
  }

  const roleCode = session.user.roleCode ?? null;
  if (!hasRole(roleCode, allowedRoles)) {
    return {
      response: buildForbiddenResponse(allowedRoles, roleCode),
    };
  }

  return { response: null };
};

export const isGuardBlocked = (
  result: GuardResult
): result is { response: NextResponse } => {
  return result.response !== null;
};
