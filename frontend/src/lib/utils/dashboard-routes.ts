export const DASHBOARD_BASE = "/dashboard";
export const PORTAL_BASE = "/portal";

export const withDashboardBase = (path: string) => {
  if (path === "/") return DASHBOARD_BASE;
  return `${DASHBOARD_BASE}${path}`;
};

export const withPosDashboardBase = (posInstanceId: string, path: string) => {
  if (path === "/") return `/${posInstanceId}${DASHBOARD_BASE}`;
  return `/${posInstanceId}${DASHBOARD_BASE}${path}`;
};

export const extractPosInstanceIdFromPath = (pathname: string) => {
  const match = pathname.match(/^\/([^/]+)\/dashboard(?:\/|$)/);
  return match?.[1] ?? null;
};

export const normalizeContextualDashboardPath = (pathname: string) => {
  const match = pathname.match(/^\/[^/]+(\/dashboard(?:\/.*)?$)/);
  return match?.[1] ?? pathname;
};

export const replacePosInDashboardPath = (
  pathname: string,
  nextPosId: string
) => {
  const normalizedPathname = pathname || "/";
  const currentPosId = extractPosInstanceIdFromPath(normalizedPathname);

  if (!currentPosId) {
    return withPosDashboardBase(nextPosId, "/");
  }

  return normalizedPathname.replace(`/${currentPosId}/dashboard`, `/${nextPosId}/dashboard`);
};
