"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPathByRole } from "@/lib/auth/paths";
import { getAuthSession } from "@/lib/auth/session";

export default function DashboardHomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    router.replace(getDashboardPathByRole(session.role));
  }, [router]);

  return null;
}
