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

  const instance = await prisma.pOSInstance.findUnique({
    where: { id },
    include: { tableLabels: { orderBy: { position: "asc" } } },
  });

  if (!instance) {
    return NextResponse.json(
      { message: "POS Instance tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(instance);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const guard = await requirePermission("pos_instance:update");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  const { id } = await params;
  const body = await request.json();

  if ("type" in body) {
    return NextResponse.json(
      { message: "Type tidak bisa diubah" },
      { status: 400 }
    );
  }

  const existing = await prisma.pOSInstance.findUnique({
    where: { id },
    include: { tableLabels: { orderBy: { position: "asc" } } },
  });

  if (!existing) {
    return NextResponse.json(
      { message: "POS Instance tidak ditemukan" },
      { status: 404 }
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name wajib diisi" },
        { status: 400 }
      );
    }
    if (body.name.length > 100) {
      return NextResponse.json(
        { message: "Name maksimal 100 karakter" },
        { status: 400 }
      );
    }

    const dup = await prisma.pOSInstance.findFirst({
      where: {
        name: { equals: body.name.trim(), mode: "insensitive" },
        id: { not: id },
      },
    });
    if (dup) {
      return NextResponse.json(
        { message: "Nama POS Instance sudah digunakan" },
        { status: 409 }
      );
    }
    updateData.name = body.name.trim();
  }

  if (body.totalTable !== undefined) {
    if (existing.type !== "TABLE_SERVICE") {
      return NextResponse.json(
        { message: "Total table hanya bisa diubah untuk Table Service" },
        { status: 400 }
      );
    }

    const newTotal = body.totalTable;
    if (typeof newTotal !== "number" || newTotal < 1 || newTotal > 200) {
      return NextResponse.json(
        { message: "Total table harus 1-200" },
        { status: 400 }
      );
    }

    const currentTotal = existing.totalTable;

    if (newTotal > currentTotal) {
      const newLabels = Array.from(
        { length: newTotal - currentTotal },
        (_, i) => ({
          posInstanceId: id,
          position: currentTotal + i + 1,
          label: String(currentTotal + i + 1),
        })
      );
      await prisma.tableLabel.createMany({ data: newLabels });
    } else if (newTotal < currentTotal) {
      await prisma.tableLabel.deleteMany({
        where: {
          posInstanceId: id,
          position: { gt: newTotal },
        },
      });
    }

    updateData.totalTable = newTotal;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { message: "isActive harus boolean" },
        { status: 400 }
      );
    }

    updateData.isActive = body.isActive;
  }

  const updated = await prisma.pOSInstance.update({
    where: { id },
    data: updateData,
    include: { tableLabels: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const guard = await requirePermission("pos_instance:delete");
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

  await prisma.pOSInstance.delete({ where: { id } });

  return NextResponse.json({ message: "POS Instance deleted" });
}
