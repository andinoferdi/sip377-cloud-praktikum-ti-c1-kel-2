import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { authValidation } from "@/features/auth/schemas/auth.schema";
import { verifyPassword } from "@/lib/auth/password";
import { resolveUserAccessFromDb } from "@/lib/auth/rbac-db";
import { prisma } from "@/lib/db/prisma";
import type { PermissionKey, RoleCode } from "@/types/rbac";

const ACCESS_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const providers: Provider[] = [
  Credentials({
    name: "Staff Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsedCredentials = authValidation.login.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const email = parsedCredentials.data.email.trim().toLowerCase();
      const password = parsedCredentials.data.password;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          fullName: true,
          email: true,
          passwordHash: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return null;
      }

      const access = await resolveUserAccessFromDb(user.id);
      if (!access.roleCode) {
        return null;
      }

      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        roleCode: access.roleCode,
        permissions: access.permissions,
        accessSyncedAt: Date.now(),
      };
    },
  }),
];

const shouldRefreshAccess = (
  roleCode: unknown,
  permissions: unknown,
  accessSyncedAt: unknown
) => {
  if (typeof roleCode !== "string" || !Array.isArray(permissions)) {
    return true;
  }

  if (typeof accessSyncedAt !== "number") {
    return true;
  }

  return Date.now() - accessSyncedAt > ACCESS_REFRESH_INTERVAL_MS;
};

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roleCode = user.roleCode ?? null;
        token.permissions = user.permissions ?? [];
        token.accessSyncedAt =
          typeof user.accessSyncedAt === "number" ? user.accessSyncedAt : Date.now();
      }

      if (
        token.sub &&
        shouldRefreshAccess(token.roleCode, token.permissions, token.accessSyncedAt)
      ) {
        const access = await resolveUserAccessFromDb(token.sub);

        token.roleCode = access.roleCode;
        token.permissions = access.permissions;
        token.accessSyncedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = token.sub ?? "";
      session.user.roleCode = (token.roleCode as RoleCode | null | undefined) ?? null;
      session.user.permissions =
        (token.permissions as PermissionKey[] | undefined) ?? [];

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
