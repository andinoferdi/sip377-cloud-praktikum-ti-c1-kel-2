import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await requirePermission("pos_instance:read");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  const session = await auth();
  const roleCode = session?.user?.roleCode ?? null;

  const instances = await prisma.pOSInstance.findMany({
    where: roleCode === "admin" ? undefined : { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(instances);
}

export async function POST(request: Request) {
  const guard = await requirePermission("pos_instance:create");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  const body = await request.json();
  const { name, type, totalTable } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { message: "Name wajib diisi" },
      { status: 400 }
    );
  }

  if (name.length > 100) {
    return NextResponse.json(
      { message: "Name maksimal 100 karakter" },
      { status: 400 }
    );
  }

  if (type !== "TABLE_SERVICE" && type !== "TAB_SERVICE") {
    return NextResponse.json(
      { message: "Type harus TABLE_SERVICE atau TAB_SERVICE" },
      { status: 400 }
    );
  }

  const existing = await prisma.pOSInstance.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" } },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Nama POS Instance sudah digunakan" },
      { status: 409 }
    );
  }

  const resolvedTotalTable =
    type === "TABLE_SERVICE"
      ? typeof totalTable === "number" && totalTable >= 1 && totalTable <= 200
        ? totalTable
        : null
      : 0;

  if (type === "TABLE_SERVICE" && resolvedTotalTable === null) {
    return NextResponse.json(
      { message: "Total table wajib diisi (1-200) untuk Table Service" },
      { status: 400 }
    );
  }

  const instance = await prisma.pOSInstance.create({
    data: {
      name: name.trim(),
      type,
      totalTable: resolvedTotalTable ?? 0,
      tableLabels:
        type === "TABLE_SERVICE" && resolvedTotalTable
          ? {
              create: Array.from({ length: resolvedTotalTable }, (_, i) => ({
                position: i + 1,
                label: String(i + 1),
              })),
            }
          : undefined,
    },
    include: { tableLabels: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(instance, { status: 201 });
}
