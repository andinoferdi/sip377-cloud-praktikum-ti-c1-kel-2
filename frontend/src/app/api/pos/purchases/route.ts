import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function GET() {
  const guard = await requirePermission("purchase:read");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("GET /api/pos/purchases");
}

export async function POST() {
  const guard = await requirePermission("purchase:create");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("POST /api/pos/purchases");
}
