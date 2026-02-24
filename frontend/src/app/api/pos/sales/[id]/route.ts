import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function GET() {
  const guard = await requirePermission("sales:read");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("GET /api/pos/sales/:id");
}

export async function PUT() {
  const guard = await requirePermission("sales:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("PUT /api/pos/sales/:id");
}

export async function DELETE() {
  const guard = await requirePermission("sales:delete");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("DELETE /api/pos/sales/:id");
}
