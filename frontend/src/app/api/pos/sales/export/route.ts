import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function GET() {
  const guard = await requirePermission("sales:export");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("GET /api/pos/sales/export");
}
