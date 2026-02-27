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

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside
      className={`surface-elevated fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-soft px-5 text-(--token-gray-900) transition-all duration-300 ease-in-out lg:mt-0
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
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={role === "dosen" ? "/dashboard/dosen/buat-qr" : "/dashboard/mahasiswa/scan"}>
          {isExpanded || isHovered || isMobileOpen ? (
            <BrandLogo size="md" />
          ) : (
            <BrandLogo size="sm" showText={false} />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] text-(--token-gray-400) ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen
                  ? role === "dosen"
                    ? "Menu Dosen"
                    : "Menu Mahasiswa"
                  : "..."}
              </h2>
              <ul className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`menu-item group ${
                        isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
                      }`}
                    >
                      <span
                        className={`${
                          isActive(item.path)
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
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
