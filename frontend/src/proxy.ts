import type { PermissionKey, RoleCode } from "@/types/rbac";
import { normalizeContextualDashboardPath } from "@/lib/utils/dashboard-routes";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DASHBOARD_RULES: Array<{ prefix: string; permission: PermissionKey }> = [
  { prefix: "/portal/pos-instances", permission: "pos_instance:read" },
  { prefix: "/portal/inventory", permission: "inventory:read" },
  { prefix: "/portal/categories", permission: "category:read" },
  { prefix: "/portal/reports", permission: "reports:read" },
  { prefix: "/portal", permission: "pos_instance:read" },
  { prefix: "/dashboard/pos/sales", permission: "sales:read" },
  { prefix: "/dashboard/pos/approval", permission: "sales_approval:read" },
  { prefix: "/dashboard/pos/purchase", permission: "purchase:read" },
  { prefix: "/dashboard/pos/stock", permission: "stock_management:read" },
  { prefix: "/dashboard/portal/pos-instances", permission: "pos_instance:read" },
  { prefix: "/dashboard/portal/inventory", permission: "inventory:read" },
  { prefix: "/dashboard/portal/categories", permission: "category:read" },
  { prefix: "/dashboard/portal/reports", permission: "reports:read" },
  { prefix: "/dashboard/portal", permission: "pos_instance:read" },
  { prefix: "/dashboard/admin/rbac", permission: "user_role:read" },
  { prefix: "/dashboard", permission: "dashboard_pos:read" },
];

const ADMIN_ONLY_ROLES: RoleCode[] = ["admin"];

type TokenAccess = {
  userId: string | null;
  roleCode: RoleCode | null;
  permissions: PermissionKey[];
};

const resolveDashboardPermission = (
  pathname: string
): PermissionKey | null => {
  const normalizedPathname = normalizeContextualDashboardPath(pathname);
  const match = DASHBOARD_RULES.find((rule) =>
    normalizedPathname.startsWith(rule.prefix)
  );

  return match?.permission ?? null;
};

const isContextualDashboardPath = (pathname: string) => {
  return /^\/[^/]+\/dashboard(?:\/|$)/.test(pathname);
};

const resolveApiPermission = (
  pathname: string,
  method: string
): PermissionKey | null => {
  if (pathname.startsWith("/api/portal/rbac")) {
    return "user_role:create";
  }

  if (pathname === "/api/pos/sales/export" && method === "GET") {
    return "sales:export";
  }

  if (
    /^\/api\/pos\/sales\/[^/]+\/approve$/.test(pathname) &&
    method === "POST"
  ) {
    return "sales_approval:approve";
  }

  if (/^\/api\/pos\/sales\/[^/]+\/print$/.test(pathname) && method === "POST") {
    return "sales:print";
  }

  if (/^\/api\/pos\/sales\/[^/]+$/.test(pathname)) {
    if (method === "GET") return "sales:read";
    if (method === "PUT") return "sales:update";
    if (method === "DELETE") return "sales:delete";
  }

  if (pathname === "/api/pos/sales") {
    if (method === "GET") return "sales:read";
    if (method === "POST") return "sales:create";
  }

  if (
    /^\/api\/pos\/purchases\/[^/]+\/approve$/.test(pathname) &&
    method === "POST"
  ) {
    return "purchase:approve";
  }

  if (/^\/api\/pos\/purchases\/[^/]+$/.test(pathname)) {
    if (method === "GET") return "purchase:read";
    if (method === "PUT") return "purchase:update";
    if (method === "DELETE") return "purchase:delete";
  }

  if (pathname === "/api/pos/purchases") {
    if (method === "GET") return "purchase:read";
    if (method === "POST") return "purchase:create";
  }

  if (/^\/api\/pos\/stock-movements\/[^/]+$/.test(pathname)) {
    if (method === "PUT") return "stock_management:update";
    if (method === "DELETE") return "stock_management:delete";
  }

  if (pathname === "/api/pos/stock-movements") {
    if (method === "GET") return "stock_management:read";
    if (method === "POST") return "stock_management:create";
  }

  if (/^\/api\/portal\/inventory\/[^/]+$/.test(pathname)) {
    if (method === "PUT") return "inventory:update";
    if (method === "DELETE") return "inventory:delete";
  }

  if (pathname === "/api/portal/inventory") {
    if (method === "GET") return "inventory:read";
    if (method === "POST") return "inventory:create";
  }

  if (/^\/api\/portal\/categories\/[^/]+$/.test(pathname)) {
    if (method === "PUT") return "category:update";
    if (method === "DELETE") return "category:delete";
  }

  if (pathname === "/api/portal/categories") {
    if (method === "GET") return "category:read";
    if (method === "POST") return "category:create";
  }

  if (pathname === "/api/portal/reports/export" && method === "GET") {
    return "reports:export";
  }

  if (pathname === "/api/portal/reports" && method === "GET") {
    return "reports:read";
  }

  if (
    /^\/api\/portal\/pos-instances\/[^/]+\/tables\/[^/]+$/.test(pathname) &&
    method === "PUT"
  ) {
    return "pos_instance:update";
  }

  if (
    /^\/api\/portal\/pos-instances\/[^/]+\/tables$/.test(pathname) &&
    method === "GET"
  ) {
    return "pos_instance:read";
  }

  if (
    /^\/api\/portal\/pos-instances\/[^/]+\/restore$/.test(pathname) &&
    method === "PATCH"
  ) {
    return "pos_instance:update";
  }

  if (/^\/api\/portal\/pos-instances\/[^/]+$/.test(pathname)) {
    if (method === "GET") return "pos_instance:read";
    if (method === "PUT") return "pos_instance:update";
    if (method === "DELETE") return "pos_instance:delete";
  }

  if (pathname === "/api/portal/pos-instances") {
    if (method === "GET") return "pos_instance:read";
    if (method === "POST") return "pos_instance:create";
  }

  return null;
};

const normalizePermissions = (value: unknown): PermissionKey[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is PermissionKey => typeof item === "string");
};

const hasRole = (roleCode: RoleCode | null, requiredRoles: RoleCode[]) => {
  if (!roleCode) return false;
  return requiredRoles.includes(roleCode);
};

const hasPermission = (
  permissions: PermissionKey[],
  requiredPermission: PermissionKey
) => {
  return permissions.includes(requiredPermission);
};

const buildApiForbiddenResponse = (
  requiredPermission: PermissionKey | "admin",
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

const getTokenAccess = async (request: NextRequest): Promise<TokenAccess> => {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  return {
    userId: token?.sub ?? null,
    roleCode: (typeof token?.roleCode === "string" ? token.roleCode : null) as RoleCode | null,
    permissions: normalizePermissions(token?.permissions),
  };
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const access = await getTokenAccess(request);

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  const requiresDashboardGuard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal") ||
    isContextualDashboardPath(pathname);

  if (requiresDashboardGuard) {
    if (!access.userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/dashboard/forbidden") {
      return NextResponse.next();
    }

    const requiredPermission = resolveDashboardPermission(pathname);
    if (
      requiredPermission &&
      !hasPermission(access.permissions, requiredPermission)
    ) {
      return NextResponse.redirect(new URL("/dashboard/forbidden", request.url));
    }

    if (!requiredPermission && !hasRole(access.roleCode, ADMIN_ONLY_ROLES)) {
      return NextResponse.redirect(new URL("/dashboard/forbidden", request.url));
    }
  }

  if (pathname.startsWith("/api")) {
    if (!access.userId) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    if (pathname === "/api/chat" && !hasRole(access.roleCode, ADMIN_ONLY_ROLES)) {
      return buildApiForbiddenResponse("admin", access.roleCode);
    }

    const requiredPermission = resolveApiPermission(pathname, request.method);
    if (
      requiredPermission &&
      !hasPermission(access.permissions, requiredPermission)
    ) {
      return buildApiForbiddenResponse(requiredPermission, access.roleCode);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/:posInstanceId/dashboard/:path*",
    "/api/chat",
    "/api/pos/:path*",
    "/api/portal/:path*",
  ],
};
