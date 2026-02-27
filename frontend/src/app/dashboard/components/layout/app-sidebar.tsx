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
    icon: <QrCode size={18} />,
  },
  {
    name: "Monitor Status",
    path: "/dashboard/dosen/monitor",
    icon: <TableIcon size={18} />,
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
    icon: <ListIcon size={18} />,
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

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-soft bg-(--token-white) px-4 text-(--token-gray-900) transition-all duration-300 ease-in-out dark:bg-(--color-surface-dark-elevated) lg:mt-0
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
      {/* Logo */}
      <div
        className={`flex py-7 ${
          !showLabels ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={role === "dosen" ? "/dashboard/dosen/buat-qr" : "/dashboard/mahasiswa/scan"}>
          {showLabels ? (
            <BrandLogo size="md" />
          ) : (
            <BrandLogo size="sm" showText={false} />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-2">
            {/* Section label */}
            <h2
              className={`mb-2 flex text-[10px] font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500) ${
                !showLabels ? "lg:justify-center" : "justify-start px-3"
              }`}
            >
              {showLabels
                ? role === "dosen"
                  ? "Menu Dosen"
                  : "Menu Mahasiswa"
                : "•••"}
            </h2>

            <ul className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      !showLabels ? "lg:justify-center" : ""
                    } ${
                      isActive(item.path)
                        ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/8 dark:bg-primary-500/10 dark:text-primary-300"
                        : "text-(--token-gray-600) hover:bg-(--token-gray-100) hover:text-(--token-gray-900) dark:text-(--token-gray-400) dark:hover:bg-(--token-white-5) dark:hover:text-(--token-white)"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive(item.path)
                          ? "bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300"
                          : "bg-(--token-gray-100) text-(--token-gray-500) group-hover:bg-(--token-gray-200) dark:bg-(--token-white-5) dark:text-(--token-gray-400)"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {showLabels && (
                      <span>{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
