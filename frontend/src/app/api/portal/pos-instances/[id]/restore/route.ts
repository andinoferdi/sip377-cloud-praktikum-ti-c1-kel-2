import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteParams) {
  const guard = await requirePermission("pos_instance:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  const { id } = await params;

  const existing = await prisma.pOSInstance.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { message: "POS Instance tidak ditemukan" },
      { status: 404 }
    );
  }

  if (existing.isActive) {
    return NextResponse.json(
      { message: "POS Instance sudah aktif" },
      { status: 400 }
    );
  }

  const updated = await prisma.pOSInstance.update({
    where: { id },
    data: { isActive: true },
    include: { tableLabels: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(updated);
}
