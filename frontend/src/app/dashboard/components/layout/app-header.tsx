"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import BrandLogo from "@/components/ui/brand-logo";
import { ThemeToggleButton } from "@/app/dashboard/components/common/ThemeToggleButton";
import { clearAuthSession } from "@/lib/auth/session";
import { clearLecturerQrSessionState } from "@/utils/home/lecturer-qr-session";
import type { AuthSession } from "@/types/auth";
import { Menu, X } from "lucide-react";
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
    <header className="surface-elevated sticky top-0 z-99999 flex w-full border-b border-soft">
      <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-soft px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg border border-soft text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)] lg:h-11 lg:w-11"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href={homePath} className="lg:hidden">
            <BrandLogo size="md" />
          </Link>
        </div>

        <div className="flex w-full items-center justify-between gap-3 px-5 py-3 lg:w-auto lg:px-0 lg:py-4">
          <div className="text-sm text-(--token-gray-700) dark:text-(--token-gray-300)">
            <p className="font-semibold">{session.name}</p>
            <p className="text-xs uppercase text-(--token-gray-500) dark:text-(--token-gray-400)">
              {session.role}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-soft px-4 py-2 text-sm font-medium text-(--token-gray-700) transition hover:bg-[var(--token-gray-100)] dark:text-(--token-gray-300) dark:hover:bg-[var(--token-white-5)]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
