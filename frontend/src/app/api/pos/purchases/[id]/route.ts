import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function GET() {
  const guard = await requirePermission("purchase:read");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("GET /api/pos/purchases/:id");
}

export async function PUT() {
  const guard = await requirePermission("purchase:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("PUT /api/pos/purchases/:id");
}

export async function DELETE() {
  const guard = await requirePermission("purchase:delete");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("DELETE /api/pos/purchases/:id");
}
