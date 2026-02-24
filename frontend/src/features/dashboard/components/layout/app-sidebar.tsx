"use client";

import { useSidebar } from "@/app/(dashboard)/dashboard/_hooks/use-sidebar";
import {
  BoxCubeIcon,
  CalenderIcon,
  DocsIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
} from "@/icons";
import { hasRole } from "@/lib/auth/rbac";
import {
  extractPosInstanceIdFromPath,
  withDashboardBase,
  withPosDashboardBase,
} from "@/lib/utils/dashboard-routes";
import type { PermissionKey, RoleCode } from "@/types/rbac";
import { useSession } from "next-auth/react";
import BrandLogo from "@/components/ui/brand-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import SidebarWidget from "./sidebar-widget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  permissionKey?: PermissionKey;
  allowedRoles?: RoleCode[];
};

const mainItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard POS",
    path: withDashboardBase("/"),
    permissionKey: "dashboard_pos:read",
  },
  {
    icon: <CalenderIcon />,
    name: "Sales POS",
    path: withDashboardBase("/pos/sales"),
    permissionKey: "sales:read",
  },
  {
    icon: <DocsIcon />,
    name: "Sales Approval",
    path: withDashboardBase("/pos/approval"),
    permissionKey: "sales_approval:read",
  },
  {
    icon: <ListIcon />,
    name: "Purchase",
    path: withDashboardBase("/pos/purchase"),
    permissionKey: "purchase:read",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Stock Management",
    path: withDashboardBase("/pos/stock"),
    permissionKey: "stock_management:read",
  },
];

const backToPortalItem: NavItem = {
  icon: <GridIcon />,
  name: "Kembali ke Portal",
  path: "/portal",
  permissionKey: "pos_instance:read",
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentPosInstanceId = extractPosInstanceIdFromPath(pathname);

  const roleCode = session?.user?.roleCode ?? null;
  const permissions = useMemo(
    () => session?.user?.permissions ?? [],
    [session?.user?.permissions]
  );

  const isActive = useCallback(
    (path: string) => pathname === path || pathname.startsWith(`${path}/`),
    [pathname]
  );

  const canAccessItem = useCallback(
    (item: NavItem) => {
      if (item.permissionKey && !permissions.includes(item.permissionKey)) {
        return false;
      }

      if (item.allowedRoles && !hasRole(roleCode, item.allowedRoles)) {
        return false;
      }

      return true;
    },
    [permissions, roleCode]
  );

  const visibleMainItems = mainItems.filter(canAccessItem);
  const visibleBackToPortalItem = canAccessItem(backToPortalItem)
    ? [backToPortalItem]
    : [];

  const resolvePath = useCallback(
    (itemPath: string) => {
      if (!currentPosInstanceId) return itemPath;
      if (itemPath.startsWith("/dashboard/portal")) {
        return itemPath.replace("/dashboard/portal", "/portal");
      }
      if (!itemPath.startsWith("/dashboard/pos") && itemPath !== "/dashboard") {
        return itemPath;
      }

      const posPath = itemPath === "/dashboard" ? "/" : itemPath.replace("/dashboard", "");
      return withPosDashboardBase(currentPosInstanceId, posPath);
    },
    [currentPosInstanceId]
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const resolvedPath = resolvePath(item.path);

        return (
          <li key={item.name}>
          <Link
            href={resolvedPath}
            className={`menu-item group ${
              isActive(resolvedPath) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`${
                isActive(resolvedPath)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              {item.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{item.name}</span>
            )}
          </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`surface-elevated fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-soft px-5 text-(--token-gray-900) transition-all duration-300 ease-in-out lg:mt-0
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={currentPosInstanceId ? withPosDashboardBase(currentPosInstanceId, "/") : withDashboardBase("/")}>
          {isExpanded || isHovered || isMobileOpen ? (
            <BrandLogo size="md" />
          ) : (
            <BrandLogo size="sm" showText={false} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {visibleBackToPortalItem.length > 0 && (
              <div>{renderMenuItems(visibleBackToPortalItem)}</div>
            )}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-(--token-gray-400) ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "POS Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(visibleMainItems)}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
