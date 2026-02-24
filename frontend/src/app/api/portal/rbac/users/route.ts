import { authValidation } from "@/features/auth/schemas/auth.schema";
import { isGuardBlocked, requirePermission } from "@/lib/auth/route-guards";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { ROLE_CODES, type RoleCode } from "@/types/rbac";
import { NextResponse } from "next/server";
import { z } from "zod";

const inviteStaffSchema = authValidation.register.extend({
  roleCode: z.enum(ROLE_CODES).default("host"),
});

export async function POST(request: Request) {
  const guard = await requirePermission("user_role:create");
  if (isGuardBlocked(guard)) {
    return guard.response;
  }

  try {
    const body = await request.json();
    const parsedBody = inviteStaffSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const firstName = parsedBody.data.firstName.trim();
    const lastName = parsedBody.data.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = parsedBody.data.email.trim().toLowerCase();
    const roleCode = parsedBody.data.roleCode;

    const [role, existingUser] = await Promise.all([
      prisma.role.findUnique({ where: { code: roleCode } }),
      prisma.user.findUnique({ where: { email } }),
    ]);

    if (!role) {
      return NextResponse.json(
        { message: "Role tidak ditemukan" },
        { status: 400 }
      );
    }

    if (existingUser) {
      // Update existing user's role
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { roleId: role.id },
      });

      return NextResponse.json(
        {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            fullName: existingUser.fullName,
          },
          assignedRole: role.code as RoleCode,
        },
        { status: 200 }
      );
    }

    const passwordHash = hashPassword(parsedBody.data.password);

    const createdUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        roleId: role.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    return NextResponse.json(
      {
        user: createdUser,
        assignedRole: role.code as RoleCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
  }
}
