import type { ReactNode } from "react";
import DashboardAuthGuard from "@/app/login/components/dashboard-auth-guard";
import DashboardShell from "@/app/dashboard/components/layout/dashboard-shell";

type DashboardGroupLayoutProps = {
  children: ReactNode;
};

export default function DashboardGroupLayout({ children }: DashboardGroupLayoutProps) {
  return (
    <DashboardAuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAuthGuard>
  );
}
