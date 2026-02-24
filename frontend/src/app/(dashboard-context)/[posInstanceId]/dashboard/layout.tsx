import { auth } from "@/auth";
import DashboardShell from "@/features/dashboard/components/layout/dashboard-shell";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type ContextualDashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ posInstanceId: string }>;
};

export default async function ContextualDashboardLayout({
  children,
  params,
}: ContextualDashboardLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    const { posInstanceId } = await params;
    redirect(`/login?callbackUrl=/${posInstanceId}/dashboard`);
  }

  const { posInstanceId } = await params;

  const posInstance = await prisma.pOSInstance.findUnique({
    where: { id: posInstanceId },
    select: { id: true, isActive: true },
  });

  if (!posInstance) {
    redirect("/portal");
  }

  if (!posInstance.isActive) {
    redirect("/portal");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
