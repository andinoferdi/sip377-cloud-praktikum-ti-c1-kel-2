"use client";

import { SidebarProvider } from "@/app/_shared/providers/sidebar-provider";
import { RightSidebarProvider } from "@/app/_shared/providers/right-sidebar-context";
import { useSidebar } from "@/app/(dashboard)/dashboard/_hooks/use-sidebar";
import AppHeader from "@/features/dashboard/components/layout/app-header";
import AppSidebar from "@/features/dashboard/components/layout/app-sidebar";
import Backdrop from "@/features/dashboard/components/layout/backdrop";
import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <RightSidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </RightSidebarProvider>
    </SidebarProvider>
  );
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="dashboard-theme-scope surface-base min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
