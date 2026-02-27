"use client";

import { SidebarProvider } from "@/providers/sidebar-provider";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import type { ReactNode } from "react";
import AppHeader from "@/app/dashboard/components/layout/app-header";
import AppSidebar from "@/app/dashboard/components/layout/app-sidebar";
import Backdrop from "@/app/dashboard/components/layout/backdrop";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const session = useAuthSession();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
            Memuat sesi pengguna…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-theme-scope surface-base min-h-dvh xl:flex">
      <AppSidebar role={session.role} />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader session={session} />
        <main className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
