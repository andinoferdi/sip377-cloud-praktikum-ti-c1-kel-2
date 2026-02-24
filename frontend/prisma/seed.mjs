import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

const loadEnvFile = (filePath) => {
  const fullPath = resolve(process.cwd(), filePath);
  if (!existsSync(fullPath)) return;

  const lines = readFileSync(fullPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx <= 0) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(".env");

/** @typedef {import("pg").Client} DbClient */

const KEY_LENGTH = 64;
const PASSWORD_HASH_PREFIX = "scrypt";
const PHASE_TIMEOUT_MS = 30_000;

const DEFAULTS = {
  adminEmail: "admin@sipos.local",
  adminPassword: "admin123",
  adminFullName: "Admin SIPOS",
  demoPassword: "demo123",
};

const permissionCatalog = [
  { module: "dashboard_pos", action: "read", description: "Akses dashboard operasional POS" },
  { module: "sales", action: "create", description: "Buat transaksi sale" },
  { module: "sales", action: "read", description: "Lihat transaksi sale" },
  { module: "sales", action: "update", description: "Ubah transaksi sale" },
  { module: "sales", action: "delete", description: "Hapus transaksi sale" },
  { module: "sales", action: "print", description: "Print struk sale" },
  { module: "sales", action: "export", description: "Export data sale" },
  { module: "sales_approval", action: "read", description: "Lihat antrian approval sale" },
  { module: "sales_approval", action: "approve", description: "Approve sale" },
  { module: "purchase", action: "create", description: "Buat purchase" },
  { module: "purchase", action: "read", description: "Lihat purchase" },
  { module: "purchase", action: "update", description: "Ubah purchase" },
  { module: "purchase", action: "delete", description: "Hapus purchase" },
  { module: "purchase", action: "approve", description: "Approve purchase" },
  { module: "purchase", action: "print", description: "Print dokumen purchase" },
  { module: "purchase", action: "export", description: "Export data purchase" },
  { module: "stock_management", action: "create", description: "Buat stock movement" },
  { module: "stock_management", action: "read", description: "Lihat stock movement" },
  { module: "stock_management", action: "update", description: "Ubah stock movement" },
  { module: "stock_management", action: "delete", description: "Hapus stock movement" },
  { module: "stock_management", action: "export", description: "Export stock movement" },
  { module: "inventory", action: "create", description: "Buat item inventory" },
  { module: "inventory", action: "read", description: "Lihat inventory" },
  { module: "inventory", action: "update", description: "Ubah inventory" },
  { module: "inventory", action: "delete", description: "Hapus inventory" },
  { module: "inventory", action: "export", description: "Export inventory" },
  { module: "category", action: "create", description: "Buat kategori" },
  { module: "category", action: "read", description: "Lihat kategori" },
  { module: "category", action: "update", description: "Ubah kategori" },
  { module: "category", action: "delete", description: "Hapus kategori" },
  { module: "category", action: "export", description: "Export kategori" },
  { module: "reports", action: "read", description: "Lihat laporan POS" },
  { module: "reports", action: "print", description: "Print laporan POS" },
  { module: "reports", action: "export", description: "Export laporan POS" },
  { module: "user_role", action: "create", description: "Buat user/role" },
  { module: "user_role", action: "read", description: "Lihat user/role" },
  { module: "user_role", action: "update", description: "Ubah user/role" },
  { module: "user_role", action: "delete", description: "Hapus user/role" },
  { module: "settings", action: "create", description: "Buat setting POS" },
  { module: "settings", action: "read", description: "Lihat setting POS" },
  { module: "settings", action: "update", description: "Ubah setting POS" },
  { module: "settings", action: "delete", description: "Hapus setting POS" },
  { module: "settings", action: "export", description: "Export setting POS" },
  { module: "pos_instance", action: "create", description: "Buat POS Instance" },
  { module: "pos_instance", action: "read", description: "Lihat POS Instance" },
  { module: "pos_instance", action: "update", description: "Ubah POS Instance" },
  { module: "pos_instance", action: "delete", description: "Hapus POS Instance" },
];

const roleSeed = [
  { code: "admin", name: "Admin", description: "Akses penuh" },
  { code: "fnb", name: "FnB", description: "Operasional sales tanpa approval" },
  {
    code: "fnb_manager",
    name: "FnB Manager",
    description: "Sales, approval, purchase, stock management",
  },
  { code: "host", name: "Host", description: "Operasional dashboard dan create sales" },
];

const rolePermissionMap = {
  admin: [
    "dashboard_pos:read",
    "sales:create",
    "sales:read",
    "sales:update",
    "sales:delete",
    "sales:print",
    "sales:export",
    "sales_approval:read",
    "sales_approval:approve",
    "purchase:create",
    "purchase:read",
    "purchase:update",
    "purchase:delete",
    "purchase:approve",
    "purchase:print",
    "purchase:export",
    "stock_management:create",
    "stock_management:read",
    "stock_management:update",
    "stock_management:delete",
    "stock_management:export",
    "inventory:create",
    "inventory:read",
    "inventory:update",
    "inventory:delete",
    "inventory:export",
    "category:create",
    "category:read",
    "category:update",
    "category:delete",
    "category:export",
    "reports:read",
    "reports:print",
    "reports:export",
    "user_role:create",
    "user_role:read",
    "user_role:update",
    "user_role:delete",
    "settings:create",
    "settings:read",
    "settings:update",
    "settings:delete",
    "settings:export",
    "pos_instance:create",
    "pos_instance:read",
    "pos_instance:update",
    "pos_instance:delete",
  ],
  fnb: ["dashboard_pos:read", "sales:create", "sales:read", "sales:print", "pos_instance:read"],
  fnb_manager: [
    "dashboard_pos:read",
    "sales:create",
    "sales:read",
    "sales:update",
    "sales:delete",
    "sales:print",
    "sales:export",
    "sales_approval:read",
    "sales_approval:approve",
    "purchase:create",
    "purchase:read",
    "purchase:update",
    "purchase:delete",
    "purchase:approve",
    "purchase:print",
    "purchase:export",
    "stock_management:create",
    "stock_management:read",
    "stock_management:update",
    "stock_management:delete",
    "stock_management:export",
    "inventory:read",
    "category:read",
    "reports:read",
    "reports:print",
    "reports:export",
    "pos_instance:read",
  ],
  host: ["dashboard_pos:read", "sales:create", "sales:read", "sales:print", "pos_instance:read"],
};

const seedUsers = [
  {
    email: DEFAULTS.adminEmail,
    fullName: DEFAULTS.adminFullName,
    password: DEFAULTS.adminPassword,
    roleCode: "admin",
  },
  {
    email: "manager@demo.sipos.local",
    fullName: "FnB Manager Demo",
    password: DEFAULTS.demoPassword,
    roleCode: "fnb_manager",
  },
  {
    email: "fnb@demo.sipos.local",
    fullName: "FnB Demo",
    password: DEFAULTS.demoPassword,
    roleCode: "fnb",
  },
  {
    email: "host@demo.sipos.local",
    fullName: "Host Demo",
    password: DEFAULTS.demoPassword,
    roleCode: "host",
  },
];

const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${hash}`;
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const withTimeout = async (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Phase timeout (${ms}ms): ${label}`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

const shortenSql = (sql) => sql.replace(/\s+/g, " ").trim().slice(0, 180);

const queryWithContext = async (client, sql, params = []) => {
  try {
    return await client.query(sql, params);
  } catch (error) {
    const context = `SQL failed: ${shortenSql(sql)}`;
    if (error instanceof Error) {
      error.message = `${error.message}\n${context}`;
    }
    throw error;
  }
};

const exec = async (client, sql, params = []) => {
  await queryWithContext(client, sql, params);
};

const one = async (client, sql, params = []) => {
  const result = await queryWithContext(client, sql, params);
  if (result.rows.length === 0) {
    throw new Error(`Expected one row, got 0. SQL: ${shortenSql(sql)}`);
  }
  return result.rows[0];
};

const many = async (client, sql, params = []) => {
  const result = await queryWithContext(client, sql, params);
  return result.rows;
};

const runPhase = async (name, task) => {
  const startedAt = Date.now();
  const value = await withTimeout(task(), PHASE_TIMEOUT_MS, name);
  const elapsed = Date.now() - startedAt;
  console.log(`Phase ${name} done in ${elapsed}ms`);
  return value;
};

const selectConnectionString = () => {
  const directUrl = process.env.DIRECT_URL?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (directUrl) return { mode: "DIRECT_URL", connectionString: directUrl };
  if (databaseUrl) return { mode: "DATABASE_URL", connectionString: databaseUrl };

  throw new Error("Missing environment variable: DIRECT_URL or DATABASE_URL is required for seeding.");
};

const maskConnectionString = (connectionString) => {
  try {
    const parsed = new URL(connectionString);
    return `${parsed.hostname}:${parsed.port || "5432"}`;
  } catch {
    return "unknown-host";
  }
};

const createDbClient = (connectionString) =>
  new Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
    query_timeout: 30_000,
    statement_timeout: 30_000,
  });

const createTables = async (client) => {
  console.log("Creating tables (if not exist)...");

  await exec(client, `CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  await exec(
    client,
    `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_code') THEN
          CREATE TYPE public.role_code AS ENUM ('admin','fnb','fnb_manager','host');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_action') THEN
          CREATE TYPE public.permission_action AS ENUM ('create','read','update','delete','approve','print','export');
        END IF;
      END $$
    `,
  );

  await exec(
    client,
    `
      CREATE TABLE IF NOT EXISTS public.roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code public.role_code NOT NULL UNIQUE,
        name text NOT NULL,
        description text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `,
  );

  await exec(
    client,
    `
      CREATE TABLE IF NOT EXISTS public.users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        full_name text NOT NULL,
        password_hash text NOT NULL,
        role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `,
  );

  await exec(
    client,
    `
      CREATE TABLE IF NOT EXISTS public.permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        module text NOT NULL,
        action public.permission_action NOT NULL,
        permission_key text NOT NULL DEFAULT '',
        description text,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(module, action),
        UNIQUE(permission_key)
      )
    `,
  );

  await exec(
    client,
    `
      CREATE OR REPLACE FUNCTION public.set_permission_key()
      RETURNS TRIGGER AS $fn$
      BEGIN
        NEW.permission_key := NEW.module || ':' || NEW.action::text;
        RETURN NEW;
      END;
      $fn$ LANGUAGE plpgsql
    `,
  );

  await exec(
    client,
    `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_permission_key'
        ) THEN
          CREATE TRIGGER trg_set_permission_key
          BEFORE INSERT OR UPDATE ON public.permissions
          FOR EACH ROW EXECUTE FUNCTION public.set_permission_key();
        END IF;
      END $$
    `,
  );

  await exec(
    client,
    `
      CREATE TABLE IF NOT EXISTS public.role_permissions (
        role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
        permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (role_id, permission_id)
      )
    `,
  );

  console.log("Tables ready.\n");
};

const seedRoles = async (client) => {
  const rolesByCode = {};

  for (const role of roleSeed) {
    const row = await one(
      client,
      `
        INSERT INTO public.roles (id, code, name, description)
        VALUES (gen_random_uuid(), $1::public.role_code, $2, $3)
        ON CONFLICT (code)
        DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
        RETURNING id, code::text AS code
      `,
      [role.code, role.name, role.description],
    );

    rolesByCode[row.code] = { id: row.id, code: row.code };
  }

  return rolesByCode;
};

const seedPermissions = async (client) => {
  const permissionsByKey = {};

  for (const perm of permissionCatalog) {
    const key = `${perm.module}:${perm.action}`;
    const row = await one(
      client,
      `
        INSERT INTO public.permissions (id, module, action, permission_key, description)
        VALUES (gen_random_uuid(), $1, $2::public.permission_action, $3, $4)
        ON CONFLICT (module, action)
        DO UPDATE SET description = EXCLUDED.description, permission_key = EXCLUDED.permission_key
        RETURNING id, module, action::text AS action
      `,
      [perm.module, perm.action, key, perm.description],
    );

    permissionsByKey[`${row.module}:${row.action}`] = {
      id: row.id,
      module: row.module,
      action: row.action,
    };
  }

  return permissionsByKey;
};

const seedRolePermissions = async (client, rolesByCode, permissionsByKey) => {
  const managedPermissionIds = Object.values(permissionsByKey).map((permission) => permission.id);

  for (const [roleCode, permissionKeys] of Object.entries(rolePermissionMap)) {
    const role = rolesByCode[roleCode];
    const expectedPermissionIds = permissionKeys.map((key) => permissionsByKey[key].id);

    for (const permissionId of expectedPermissionIds) {
      await exec(
        client,
        `
          INSERT INTO public.role_permissions (role_id, permission_id)
          VALUES ($1::uuid, $2::uuid)
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `,
        [role.id, permissionId],
      );
    }

    const staleIds = managedPermissionIds.filter((id) => !expectedPermissionIds.includes(id));
    if (staleIds.length > 0) {
      await exec(
        client,
        `
          DELETE FROM public.role_permissions
          WHERE role_id = $1::uuid AND permission_id = ANY($2::uuid[])
        `,
        [role.id, staleIds],
      );
    }
  }
};

const seedAppUsers = async (client, rolesByCode) => {
  for (const user of seedUsers) {
    const role = rolesByCode[user.roleCode];
    const passwordHash = hashPassword(user.password);

    await exec(
      client,
      `
        INSERT INTO public.users (id, email, full_name, password_hash, role_id, is_active, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4::uuid, TRUE, now(), now())
        ON CONFLICT (email)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          password_hash = EXCLUDED.password_hash,
          role_id = EXCLUDED.role_id,
          is_active = EXCLUDED.is_active,
          updated_at = now()
      `,
      [normalizeEmail(user.email), user.fullName, passwordHash, role.id],
    );
  }
};

const countSummary = async (client) => {
  const [roleRow] = await many(client, `SELECT COUNT(*)::int AS total FROM public.roles`);
  const [permissionRow] = await many(client, `SELECT COUNT(*)::int AS total FROM public.permissions`);
  const [userRow] = await many(client, `SELECT COUNT(*)::int AS total FROM public.users`);

  return {
    roleCount: roleRow.total,
    permissionCount: permissionRow.total,
    userCount: userRow.total,
  };
};

const main = async () => {
  const { mode, connectionString } = selectConnectionString();
  const target = maskConnectionString(connectionString);

  console.log(`Seed DB target: ${target} via ${mode}`);

  /** @type {DbClient} */
  const client = createDbClient(connectionString);

  try {
    await client.connect();

    await runPhase("createTables", () => createTables(client));
    const rolesByCode = await runPhase("seedRoles", () => seedRoles(client));
    const permissionsByKey = await runPhase("seedPermissions", () => seedPermissions(client));
    await runPhase("seedRolePermissions", () =>
      seedRolePermissions(client, rolesByCode, permissionsByKey),
    );
    await runPhase("seedUsers", () => seedAppUsers(client, rolesByCode));

    const result = await runPhase("countSummary", () => countSummary(client));

    console.log("Seed finished.");
    console.log(JSON.stringify(result, null, 2));
    console.log("");
    console.log("Default credentials:");
    console.log(`  Admin  : ${DEFAULTS.adminEmail} / ${DEFAULTS.adminPassword}`);
    console.log(`  Manager: manager@demo.sipos.local / ${DEFAULTS.demoPassword}`);
    console.log(`  FnB    : fnb@demo.sipos.local / ${DEFAULTS.demoPassword}`);
    console.log(`  Host   : host@demo.sipos.local / ${DEFAULTS.demoPassword}`);
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error("Seed failed.");
  console.error(error);
  process.exitCode = 1;
});
