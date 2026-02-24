import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const guard = await requirePermission("pos_instance:read");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  const { id } = await params;

  const instance = await prisma.pOSInstance.findUnique({ where: { id } });
  if (!instance) {
    return NextResponse.json(
      { message: "POS Instance tidak ditemukan" },
      { status: 404 }
    );
  }

  const tables = await prisma.tableLabel.findMany({
    where: { posInstanceId: id },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(tables);
}
