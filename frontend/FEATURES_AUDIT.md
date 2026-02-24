# FEATURES AUDIT

## Snapshot singkat

Repo saat ini adalah boilerplate `Next.js + dashboard + AI chat`, belum merupakan sistem POS murni.

## Tech stack yang terdeteksi

- Frontend: Next.js App Router, React, TypeScript strict, Tailwind CSS v4, Radix UI, Sonner, Lucide.
- State dan data fetching: TanStack Query, Zustand.
- Backend API: Route Handlers di `src/app/api`.
- Auth: Auth.js (`next-auth`) dengan credentials staff POS dan session JWT.
- Database: Prisma + PostgreSQL dengan model RBAC (`workspaces`, `staff_users`, `rbac_roles`, `rbac_permissions`, `rbac_role_permissions`, `rbac_user_roles`).
- AI: endpoint chat streaming ke OpenAI via AI SDK.
- Testing: Vitest unit test untuk layer utilitas (`fetcher`, `errors`, `query-keys`).

## Fitur yang ada sekarang

- Marketing pages dan layout publik.
- Dashboard UI template dengan komponen ecommerce, chart, table, form, chat, profile.
- Auth route internal: `/api/auth/[...nextauth]`.
- Login/reset password page tersedia, register publik sudah dinonaktifkan.
- Route POS dan portal RBAC scaffold sudah tersedia di `/api/pos/*` dan `/api/portal/*`.
- Endpoint AI chat: `POST /api/chat`.
- Endpoint health check: `GET /api/health`.

## Inventaris route utama

- Pages (`src/app`): route marketing, auth, dashboard template, dan halaman POS placeholder.
- API (`src/app/api`): route auth, health, chat, POS, dan portal RBAC scaffold.
- API yang aktif:
  - `/api/auth/[...nextauth]`
  - `/api/chat`
  - `/api/health`

## Peta modul saat ini

- `src/app`: routing, layout, providers, API handlers.
- `src/features/marketing`: section landing, pricing, contact, privacy.
- `src/features/dashboard`: UI dashboard template.
- `src/features/auth`: form auth dan schema validasi.
- `src/features/ai`: prompt dan model AI.
- `src/services`: shared fetcher dan health service.
- `src/hooks`: query key dan health query.
- `src/lib`: errors, utils, prisma singleton.

## Temuan domain terhadap target POS murni

- Tidak ditemukan modul POS inti: `Sale`, `Purchase`, `StockMovement`, `AccountCharge`, `Inventory`, `Cashier Session`.
- API POS dan portal sudah ada sebagai endpoint scaffold, tetapi logic transaksi jual beli, stock in/out, closing kasir, dan posting biaya akun belum diimplementasi.
- Fitur export operasional dan print struk sudah diproteksi di level permission, tetapi implementasi bisnis masih belum berjalan.
- Tidak ditemukan implementasi domain properti atau PMS aktif. Tidak ada logic `room availability`, `occupancy`, atau integrasi kamar.

## Kesimpulan audit

Baseline saat ini cocok sebagai fondasi UI dan pola coding, tetapi fungsi bisnisnya masih template umum dan AI demo. Untuk menjadi POS murni, domain model dan alur transaksi inti perlu dibangun ulang di atas fondasi App Router yang sudah ada.

## RBAC Status

### match

- Auth.js sudah menggunakan `Credentials` untuk login staff POS.
- Session payload sudah membawa `user.id`, `roleCodes`, `permissions`, dan `activeWorkspaceId`.
- Source of truth permission sudah `DB-driven` dari tabel RBAC Supabase lewat Prisma.
- Guard route sudah aktif di `proxy` untuk dashboard dan API POS, tanpa import module Node-only.
- Public register sudah dinonaktifkan, onboarding staff melalui endpoint admin invite.

### partial

- Halaman POS utama sudah tersedia sebagai placeholder route (`/dashboard/pos/*`, `/dashboard/portal/*`).
- Endpoint POS dan portal sudah tersedia sebagai protected scaffold, tetapi logic bisnis masih `501 not implemented`.
- Sidebar dashboard sudah difilter berdasarkan claim permission di session.
- Endpoint admin RBAC user invite sudah ada, tetapi UI manajemen role-assignment belum operasional.

### missing

- Belum ada implementasi CRUD transaksi POS nyata (`sales`, `purchase`, `stock movement`).
- Belum ada UI manajemen role dan assignment user yang operasional (baru endpoint API).
- Belum ada test integration atau E2E untuk seluruh matrix akses per role.

## POS Portal & Instance Status

### Desain

- Execution plan tersedia di `execplans/02_pos_portal_instances.md`.
- Model data: `POSInstance` (enum `TABLE_SERVICE`/`TAB_SERVICE`) dan `TableLabel` (label unik per instance).
- Permission module baru: `pos_instance` dengan aksi `create`, `read`, `update`, `delete`.
- Akses berbasis role dan Workspace, bukan penugasan per outlet.
- Inventory dan categories global, `pos_instance_id` pada transaksi untuk audit per outlet.

### match

- Tidak ada referensi property, PMS, atau MyListTrip di codebase.
- Glossary POS Instance sudah didefinisikan di `execplans/00_foundation_pos_only.md`.

### partial

- Portal route placeholder sudah ada di sidebar (`/dashboard/portal/*`) dan endpoint scaffold (`/api/portal/*`).
- Konten portal saat ini masih merujuk inventory/categories/reports, belum mencakup outlet management.

### missing

- Belum ada model `POSInstance` dan `TableLabel` di `prisma/schema.prisma`.
- Belum ada CRUD endpoint dan halaman portal untuk POS Instance.
- Belum ada permission module `pos_instance` di seed data dan RBAC types.
- Belum ada redirect logic per role saat klik card POS Instance.
- Belum ada UI card grid portal, form create/edit, dan table label editor.
