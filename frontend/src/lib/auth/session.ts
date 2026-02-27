import type { AuthSession } from "@/types/auth";

const AUTH_SESSION_KEY = "ctc_auth_session";

function isBrowser() {
  return typeof window !== "undefined";
}

export function setAuthSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<AuthSession>;
    if (
      !parsedValue ||
      typeof parsedValue.identifier !== "string" ||
      typeof parsedValue.name !== "string" ||
      (parsedValue.role !== "dosen" && parsedValue.role !== "mahasiswa") ||
      typeof parsedValue.login_at !== "string"
    ) {
      return null;
    }

    return {
      identifier: parsedValue.identifier,
      role: parsedValue.role,
      name: parsedValue.name,
      login_at: parsedValue.login_at,
    };
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function requireAuthSession() {
  const session = getAuthSession();
  if (!session) {
    throw new Error("unauthorized");
  }
  return session;
}
