import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function PUT() {
  const guard = await requirePermission("category:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("PUT /api/portal/categories/:id");
}

export async function DELETE() {
  const guard = await requirePermission("category:delete");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("DELETE /api/portal/categories/:id");
}
