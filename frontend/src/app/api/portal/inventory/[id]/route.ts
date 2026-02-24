import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function PUT() {
  const guard = await requirePermission("inventory:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("PUT /api/portal/inventory/:id");
}

export async function DELETE() {
  const guard = await requirePermission("inventory:delete");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("DELETE /api/portal/inventory/:id");
}
