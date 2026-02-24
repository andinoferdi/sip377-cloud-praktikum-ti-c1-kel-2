import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/portal");
  }

  return children;
}
