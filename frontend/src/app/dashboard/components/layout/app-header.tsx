"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import BrandLogo from "@/components/ui/brand-logo";
import { ThemeToggleButton } from "@/app/dashboard/components/common/ThemeToggleButton";
import { clearAuthSession } from "@/lib/auth/session";
import { clearLecturerQrSessionState } from "@/utils/home/lecturer-qr-session";
import type { AuthSession } from "@/types/auth";
import { Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AppHeaderProps = {
  session: AuthSession;
};

export default function AppHeader({ session }: AppHeaderProps) {
  const router = useRouter();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const homePath =
    session.role === "dosen" ? "/dashboard/dosen/buat-qr" : "/dashboard/mahasiswa/scan";

  function handleToggle() {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
      return;
    }
    toggleMobileSidebar();
  }

  function handleLogout() {
    clearLecturerQrSessionState();
    clearAuthSession();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-99999 border-b border-soft bg-(--token-white)/90 backdrop-blur-xl dark:bg-(--color-surface-dark-elevated)/90">
      <div className="flex w-full items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: hamburger + mobile logo */}
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-soft text-(--token-gray-500) transition-colors hover:bg-(--token-gray-100) dark:text-(--token-gray-400) dark:hover:bg-(--token-white-5)"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href={homePath} className="lg:hidden">
            <BrandLogo size="md" />
          </Link>
        </div>

        {/* Right: user info + actions */}
        <div className="flex items-center gap-2.5">
          {/* User badge */}
          <div className="hidden items-center gap-2 rounded-full border border-soft px-3 py-1.5 sm:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="max-w-[120px] text-xs leading-tight">
              <p className="truncate font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                {session.name}
              </p>
              <p className="capitalize text-(--token-gray-500) dark:text-(--token-gray-400)">
                {session.role}
              </p>
            </div>
          </div>

          <ThemeToggleButton />

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-soft px-3 py-2 text-xs font-medium text-(--token-gray-600) transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:text-(--token-gray-300) dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
