export const ATTENDANCE_QR_TTL_MS = 2 * 60 * 1000;

function parseDateToMs(value: string | null): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

export function isTokenExpired(expiresAt: string | null, nowMs = Date.now()) {
  const expiresAtMs = parseDateToMs(expiresAt);
  if (expiresAtMs === null) return false;
  return nowMs >= expiresAtMs;
}

export function getRemainingMs(expiresAt: string | null, nowMs = Date.now()) {
  const expiresAtMs = parseDateToMs(expiresAt);
  if (expiresAtMs === null) return 0;
  return Math.max(expiresAtMs - nowMs, 0);
}

export function getNextRefreshAt(expiresAt: string | null, autoRefreshEnabled: boolean) {
  if (!autoRefreshEnabled || !expiresAt) return null;
  return expiresAt;
}

export function formatRemainingSeconds(expiresAt: string | null, nowMs = Date.now()) {
  const remainingMs = getRemainingMs(expiresAt, nowMs);
  return Math.ceil(remainingMs / 1000);
}
