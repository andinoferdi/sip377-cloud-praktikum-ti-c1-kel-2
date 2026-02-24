# 01 Auth RBAC POS Murni

## Ringkasan implementasi
Fokus RBAC dikunci untuk POS murni tanpa konsep property, PMS, room availability, atau occupancy. Fondasi auth memakai Auth.js credentials, data RBAC memakai Prisma on Supabase Postgres, dan guard akses diterapkan ke dashboard serta API POS.

## Matriks permission per menu dan aksi
Legend role: `ADM` (Admin), `FNB`, `FM` (FnB Manager), `HST` (Host).

| Menu Modul | create | read | update | delete | approve | print | export |
|---|---|---|---|---|---|---|---|
| POS Dashboard Operasional | - | ADM,FNB,FM,HST | - | - | - | - | - |
| Sales POS | ADM,FNB,FM,HST | ADM,FNB,FM,HST | ADM,FM | ADM,FM | - | ADM,FNB,FM,HST | ADM,FM |
| Sales Approval | - | ADM,FM | - | - | ADM,FM | - | - |
| Purchase | ADM,FM | ADM,FM | ADM,FM | ADM,FM | ADM,FM | ADM,FM | ADM,FM |
| Stock Management | ADM,FM | ADM,FM | ADM,FM | ADM,FM | - | - | ADM,FM |
| Inventory Portal | ADM | ADM,FM | ADM | ADM | - | - | ADM |
| Category Portal | ADM | ADM,FM | ADM | ADM | - | - | ADM |
| Reports POS | - | ADM,FM | - | - | - | ADM,FM | ADM,FM |
| User & Role Management | ADM | ADM | ADM | ADM | - | - | ADM |
| System Settings POS | ADM | ADM | ADM | ADM | - | - | ADM |

Catatan operasional:
1. FnB tidak punya approval.
2. FnB Manager inventory dan category hanya read.
3. Host hanya dashboard operasional dan create/read/print sales.

## Daftar halaman dan endpoint yang diproteksi
### Halaman
1. `/dashboard` dan seluruh turunan wajib authenticated.
2. Route POS baru:
   - `/dashboard/pos/sales`
   - `/dashboard/pos/approval`
   - `/dashboard/pos/purchase`
   - `/dashboard/pos/stock`
   - `/dashboard/portal/inventory`
   - `/dashboard/portal/categories`
   - `/dashboard/portal/reports`
   - `/dashboard/admin/rbac`
3. Route template non POS sementara dibatasi `admin-only` lewat proxy fallback.
4. Route forbidden untuk role tanpa hak: `/dashboard/forbidden`.

### Endpoint existing
1. `/api/auth/[...nextauth]` tetap public untuk auth flow.
2. `/api/health` tetap public untuk health probe.
3. `/api/chat` diproteksi `admin-only`.

### Endpoint POS target
1. `GET/POST /api/pos/sales` -> `sales:read|create`.
2. `GET/PUT/DELETE /api/pos/sales/:id` -> `sales:read|update|delete`.
3. `POST /api/pos/sales/:id/approve` -> `sales_approval:approve`.
4. `POST /api/pos/sales/:id/print` -> `sales:print`.
5. `GET /api/pos/sales/export` -> `sales:export`.
6. `GET/POST /api/pos/purchases` -> `purchase:read|create`.
7. `GET/PUT/DELETE /api/pos/purchases/:id` -> `purchase:read|update|delete`.
8. `POST /api/pos/purchases/:id/approve` -> `purchase:approve`.
9. `GET/POST /api/pos/stock-movements` -> `stock_management:read|create`.
10. `PUT/DELETE /api/pos/stock-movements/:id` -> `stock_management:update|delete`.
11. `GET /api/portal/inventory` -> `inventory:read`.
12. `POST /api/portal/inventory` -> `inventory:create`.
13. `PUT/DELETE /api/portal/inventory/:id` -> `inventory:update|delete`.
14. `GET /api/portal/categories` -> `category:read`.
15. `POST /api/portal/categories` -> `category:create`.
16. `PUT/DELETE /api/portal/categories/:id` -> `category:update|delete`.
17. `GET /api/portal/reports` -> `reports:read`.
18. `GET /api/portal/reports/export` -> `reports:export`.
19. `POST /api/portal/rbac/roles` -> `user_role:create` (`admin-only`).
20. `POST /api/portal/rbac/users` -> `user_role:create` (`admin-only`, invite/create staff).

Status endpoint saat ini:
1. Semua endpoint di atas sudah diproteksi permission.
2. Logic bisnis masih placeholder `501 not implemented`.

## Skema data role dan seeding
Implementasi sumber data:
1. Prisma schema: `prisma/schema.prisma`
2. SQL Supabase siap pakai: `prisma/supabase_rbac_pos.sql`

Entity utama:
1. `workspaces`
2. `staff_users`
3. `rbac_roles`
4. `rbac_permissions`
5. `rbac_role_permissions`
6. `rbac_user_roles`

Enum:
1. `role_code`: `admin | fnb | fnb_manager | host`
2. `permission_action`: `create | read | update | delete | approve | print | export`

Seeding:
1. Workspace default `main`.
2. Role default `admin`, `fnb`, `fnb_manager`, `host`.
3. Catalog permission POS sesuai matriks.
4. Join seed role-permission sesuai matrix final.

Catatan bootstrap user:
1. Endpoint `POST /api/auth/register` dinonaktifkan untuk publik (`403`).
2. Onboarding staff dilakukan admin melalui `POST /api/portal/rbac/users`.
3. Role assignment tetap per workspace (`workspaceCode`, default `main`).

## Normalisasi env lokal
Target env untuk SIPOS:
```env
AUTH_SECRET=CHANGE_ME_STRONG_SECRET
AUTH_URL=http://localhost:3000

AUTH_GITHUB_ID=CHANGE_ME
AUTH_GITHUB_SECRET=CHANGE_ME

DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres

OPENAI_API_KEY=CHANGE_ME

NEXT_PUBLIC_SUPABASE_URL=<existing>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<existing>
```

Cleanup yang sudah diterapkan:
1. `OPENROUTER_API_KEY` dihapus dari SIPOS.
2. `SESSION_SECRET` dihapus dari SIPOS.
3. `NEXT_PUBLIC_SITE_*` yang tidak dipakai dihapus dari SIPOS.

## Test plan akses per role
1. Unit test resolver permission.
   - Verifikasi role ke permission sesuai matrix.
2. API integration test.
   - Anonymous ke endpoint protected harus `401`.
   - Role tanpa hak harus `403`.
   - Role dengan hak harus `2xx` atau `501` selama bisnis belum diimplementasi.
3. E2E halaman.
   - Visibility menu sidebar sesuai role.
   - Akses direct URL tanpa hak diarahkan ke `/dashboard/forbidden`.
4. Regression role checks.
   - Admin dapat semua akses.
   - FnB hanya sales operasional tanpa approval.
   - FnB Manager dapat approval, purchase, stock, inventory/category read.
   - Host dapat dashboard dan create/read/print sales tanpa portal CRUD.
