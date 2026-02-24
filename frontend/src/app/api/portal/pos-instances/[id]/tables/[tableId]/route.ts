import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string; tableId: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const guard = await requirePermission("pos_instance:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  const { id, tableId } = await params;
  const body = await request.json();
  const { label } = body;

  if (!label || typeof label !== "string" || label.trim().length === 0) {
    return NextResponse.json(
      { message: "Label wajib diisi" },
      { status: 400 }
    );
  }

  if (label.trim().length > 10) {
    return NextResponse.json(
      { message: "Label maksimal 10 karakter" },
      { status: 400 }
    );
  }

  const table = await prisma.tableLabel.findFirst({
    where: { id: tableId, posInstanceId: id },
  });

  if (!table) {
    return NextResponse.json(
      { message: "Table tidak ditemukan" },
      { status: 404 }
    );
  }

  const dup = await prisma.tableLabel.findFirst({
    where: {
      posInstanceId: id,
      label: { equals: label.trim(), mode: "insensitive" },
      id: { not: tableId },
    },
  });

  if (dup) {
    return NextResponse.json(
      { message: "Label sudah digunakan di POS Instance ini" },
      { status: 409 }
    );
  }

  const updated = await prisma.tableLabel.update({
    where: { id: tableId },
    data: { label: label.trim() },
  });

  return NextResponse.json(updated);
}
