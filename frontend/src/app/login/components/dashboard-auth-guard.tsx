"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getDashboardPathByRole } from "@/lib/auth/paths";
import { getAuthSession } from "@/lib/auth/session";

type DashboardAuthGuardProps = {
  children: ReactNode;
};

const ROLE_SEGMENT = {
  dosen: "/dashboard/dosen",
  mahasiswa: "/dashboard/mahasiswa",
} as const;

export default function DashboardAuthGuard({ children }: DashboardAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    const expectedSegment = ROLE_SEGMENT[session.role];
    if (pathname.startsWith("/dashboard") && !pathname.startsWith(expectedSegment)) {
      router.replace(getDashboardPathByRole(session.role));
      return;
    }

    setIsAuthorized(true);
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
        Memuat dashboard...
      </div>
    );
  }

  return <>{children}</>;
}
