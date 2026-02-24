import type { RoleCode } from "@/types/rbac";
import { withPosDashboardBase } from "@/lib/utils/dashboard-routes";

export const getPosEntryRoute = (roleCode: RoleCode | null, posInstanceId: string) => {
  if (roleCode === "fnb") {
    return withPosDashboardBase(posInstanceId, "/pos/sales/create");
  }

  if (roleCode === "fnb_manager" || roleCode === "host") {
    return withPosDashboardBase(posInstanceId, "/pos/sales");
  }

  return withPosDashboardBase(posInstanceId, "/");
};
