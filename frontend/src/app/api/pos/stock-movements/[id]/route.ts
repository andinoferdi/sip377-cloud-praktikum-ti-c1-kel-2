import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { buildNotImplementedResponse } from "@/lib/http/not-implemented";

export async function PUT() {
  const guard = await requirePermission("stock_management:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("PUT /api/pos/stock-movements/:id");
}

export async function DELETE() {
  const guard = await requirePermission("stock_management:delete");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  return buildNotImplementedResponse("DELETE /api/pos/stock-movements/:id");
}
