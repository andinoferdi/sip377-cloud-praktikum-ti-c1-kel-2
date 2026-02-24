import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function GET() {
  const guard = await requirePermission("inventory:read");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("GET /api/portal/inventory");
}

export async function POST() {
  const guard = await requirePermission("inventory:create");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("POST /api/portal/inventory");
}
