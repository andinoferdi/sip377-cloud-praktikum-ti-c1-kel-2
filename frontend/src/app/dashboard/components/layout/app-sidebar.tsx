"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import BrandLogo from "@/components/ui/brand-logo";
import { CalenderIcon, ListIcon, TableIcon } from "@/icons";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import type { AuthRole } from "@/types/auth";

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const DOSEN_ITEMS: NavItem[] = [
  {
    name: "Buat QR",
    path: "/dashboard/dosen/buat-qr",
    icon: <QrCode size={16} />,
  },
  {
    name: "Monitor Status",
    path: "/dashboard/dosen/monitor",
    icon: <TableIcon size={16} />,
  },
];

const MAHASISWA_ITEMS: NavItem[] = [
  {
    name: "Scan QR",
    path: "/dashboard/mahasiswa/scan",
    icon: <CalenderIcon />,
  },
  {
    name: "Riwayat Saya",
    path: "/dashboard/mahasiswa/riwayat",
    icon: <ListIcon size={16} />,
  },
];

type AppSidebarProps = {
  role: AuthRole;
};

export default function AppSidebar({ role }: AppSidebarProps) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const menuItems = role === "dosen" ? DOSEN_ITEMS : MAHASISWA_ITEMS;
  const showLabels = isExpanded || isHovered || isMobileOpen;
  const homePath =
    role === "dosen" ? "/dashboard/dosen/buat-qr" : "/dashboard/mahasiswa/scan";

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        "fixed left-0 top-0 z-50 mt-[53px] flex h-screen flex-col border-r border-soft bg-(--token-white) transition-all duration-300 ease-in-out dark:bg-(--color-surface-dark-elevated) lg:mt-0",
        isExpanded || isMobileOpen
          ? "w-[260px]"
          : isHovered
            ? "w-[260px]"
            : "w-[72px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      {/* Logo */}
      <div
        className={`flex shrink-0 border-b border-soft py-4 px-4 ${
          showLabels ? "justify-start" : "lg:justify-center"
        }`}
      >
        <Link href={homePath}>
          {showLabels ? (
            <BrandLogo size="md" />
          ) : (
            <BrandLogo size="sm" showText={false} />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 overflow-y-auto p-3">
        {/* Section label */}
        <p
          className={[
            "mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500)",
            !showLabels ? "lg:text-center" : "",
          ].join(" ")}
        >
          {showLabels ? (role === "dosen" ? "Menu Dosen" : "Menu Mahasiswa") : "•"}
        </p>

        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={[
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                !showLabels ? "lg:justify-center" : "",
                active
                  ? "bg-(--token-gray-100) text-(--token-gray-900) dark:bg-(--token-white-10) dark:text-(--token-white)"
                  : "text-(--token-gray-500) hover:bg-(--token-gray-100) hover:text-(--token-gray-800) dark:text-(--token-gray-400) dark:hover:bg-(--token-white-5) dark:hover:text-(--token-white)",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                  active
                    ? "bg-primary-600 text-white dark:text-white"
                    : "bg-(--token-gray-100) text-(--token-gray-500) dark:bg-(--token-white-5) dark:text-(--token-gray-400)",
                ].join(" ")}
              >
                {item.icon}
              </span>
              {showLabels && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}