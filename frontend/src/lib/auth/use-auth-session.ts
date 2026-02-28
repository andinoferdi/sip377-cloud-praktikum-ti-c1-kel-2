"use client";

import { useEffect, useState } from "react";
import type { AuthSession } from "@/types/auth";
import { getAuthSession } from "@/lib/auth/session";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  return session;
}
