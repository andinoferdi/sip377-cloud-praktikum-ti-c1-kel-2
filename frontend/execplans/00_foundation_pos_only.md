# 00 Foundation POS Only

## Tujuan dan batas keras
Rebuild sistem menjadi POS murni. Scope dikunci ke transaksi retail dan operasional kasir. Sistem ini bukan sistem properti, bukan PMS, bukan hotel, tidak ada integrasi kamar, tidak ada availability room, dan tidak ada occupancy logic.

## Ringkasan tech stack
- Backend: Next.js App Router Route Handlers (`src/app/api/**/route.ts`).
- Frontend: Next.js App Router + React + TypeScript strict + Tailwind v4.
- Database: PostgreSQL via Prisma (`prisma/schema.prisma`, `src/lib/db/prisma.ts`).
- Auth: Auth.js (`next-auth`) dengan provider GitHub (`src/auth.ts`, `/api/auth/[...nextauth]`).
- Export: belum ada flow export operasional POS yang berjalan.
- Print: belum ada flow print struk/nota yang berjalan.

## Peta modul aplikasi saat ini
- Entrypoint aplikasi:
  - `src/app/layout.tsx` untuk root layout dan provider global.
  - `src/app/(marketing)/page.tsx` untuk landing.
  - `src/app/(dashboard)/dashboard/page.tsx` untuk dashboard utama.
- Entrypoint API:
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/app/api/chat/route.ts`
  - `src/app/api/health/route.ts`
- Boundary folder:
  - `src/app`: routing, layout, API handlers, shared providers.
  - `src/features/*`: domain UI per fitur (`marketing`, `dashboard`, `auth`, `ai`).
  - `src/components`: UI reusable lintas fitur.
  - `src/services`: shared service layer (`fetcher`, `health-service`).
  - `src/hooks`: shared hooks.
  - `src/lib`: utilitas, error helper, prisma singleton.
  - `src/stores`: Zustand stores untuk state UI.

## Glosarium entitas POS murni
- Workspace: konteks tenant bisnis atau unit usaha yang memiliki data POS terisolasi.
- POS Instance: perangkat atau sesi terminal kasir yang aktif pada suatu workspace.
- Sale: transaksi penjualan ke pelanggan, termasuk item, qty, harga, diskon, pajak, pembayaran.
- Purchase: transaksi pembelian dari supplier untuk menambah stok.
- StockMovement: mutasi stok yang dapat dilacak, misalnya sale, purchase, adjustment, void.
- AccountCharge: pembebanan biaya ke akun pelanggan atau akun internal non-room.

## Scope yang wajib dihapus
- Property system.
- PMS.
- Availability room.
- Occupancy logic.
- Terminologi dan alur yang mengasumsikan hotel, kamar, reservasi, check-in, check-out, folio kamar.

## Strategi parity
- Perilaku yang harus tetap sama:
  - Pola App Router dan Route Handlers.
  - Pola service layer (`fetcher`) dan error handling terstruktur.
  - Pola state dan data fetching (TanStack Query + hooks).
  - Pola pemisahan folder `app`, `features`, `services`, `types`, `lib`.
  - Pola auth baseline via Auth.js sebagai gerbang akses dashboard.
- Yang cukup diganti label atau istilah:
  - `Room Charge` menjadi `AccountCharge`.
  - Terminologi `guest` menjadi `customer` jika muncul.
  - Terminologi `reservation` menjadi `order/sale` jika muncul.
- Yang tidak dibawa ke fondasi POS:
  - Domain logic terkait kamar, availability, occupancy, dan PMS workflow.
  - Alur AI demo yang tidak relevan ke transaksi POS inti.

## Milestone global rebuild POS murni
- M0 Scope Lock:
  - Bekukan scope POS only, tetapkan kamus domain final, dan larang fitur non-POS masuk backlog inti.
- M1 Foundation Domain:
  - Definisikan model data inti POS untuk Workspace, POS Instance, Sale, Purchase, StockMovement, AccountCharge.
  - Tetapkan boundary modul backend frontend per domain.
- M2 Core Transaction Flows:
  - Rancang alur transaksi Sale dan Purchase end-to-end.
  - Rancang mekanisme posting otomatis ke StockMovement.
- M3 Inventory and Charge Integrity:
  - Rancang aturan konsistensi stok, reversal, void, correction.
  - Rancang lifecycle AccountCharge dan status settlement.
- M4 API and UI Consolidation:
  - Konsolidasikan route API domain POS.
  - Konsolidasikan halaman dashboard menjadi workflow POS operasional, bukan template demo.
- M5 Operational Output:
  - Definisikan spesifikasi export operasional.
  - Definisikan spesifikasi print struk dan dokumen kasir.
- M6 Hardening and Release:
  - Tetapkan test matrix domain POS.
  - Tetapkan baseline observability, rollback plan, dan readiness checklist rilis.
