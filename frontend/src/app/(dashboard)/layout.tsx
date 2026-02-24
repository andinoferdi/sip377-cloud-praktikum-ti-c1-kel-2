import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type DashboardGroupLayoutProps = {
  children: ReactNode;
};

export default async function DashboardGroupLayout({
  children,
}: DashboardGroupLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return children;
}
