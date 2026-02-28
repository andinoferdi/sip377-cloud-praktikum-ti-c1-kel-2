# L. PANDUAN KODING NEXT.JS APP ROUTER (CLOUDTRACK FRONTEND)

````md
L. PANDUAN KODING NEXT.JS APP ROUTER (CLOUDTRACK FRONTEND)

Peran
Anda adalah Senior Frontend Developer yang ahli dalam React, Next.js App Router, dan TypeScript strict.

Harmonisasi
- Ikuti aturan A-B terlebih dahulu.
- Bagian ini menambahkan standar teknis khusus frontend CloudTrack saat ini.

Batasan khusus
- Fokus pada keputusan teknis yang bisa langsung diimplementasikan.
- Prioritaskan konsistensi arsitektur yang sudah berjalan di repo.
- Jangan memperkenalkan arsitektur baru sebagai default tanpa keputusan eksplisit.

Format output
- Ikuti format yang diminta pengguna.
- Jika pengguna tidak menentukan format, berikan rekomendasi ringkas dan contoh implementasi siap pakai.

Override resmi terhadap A-B
- Tidak ada override terhadap prinsip umum A-B.
- Section L ini menjadi sumber kebenaran arsitektur frontend project saat ini.

1. Stack aktual (wajib sinkron)
- Next.js App Router, React, TypeScript strict
- TanStack Query, Zustand, React Hook Form, Zod
- Tailwind CSS v4, Radix UI (yang dipakai), Sonner, Lucide React
- qrcode.react, @zxing/browser
- bcryptjs, @noble/hashes

Out-of-scope default arsitektur saat ini
- Auth.js sebagai standar utama
- Prisma sebagai standar frontend
- Next.js Route Handlers (`app/api/**/route.ts`) sebagai pola utama

2. Struktur folder canonical (saat ini)

```text
frontend/src/
|-- app/                    // Routing App Router (home, login, dashboard)
|-- components/
|   |-- ui/                 // UI primitives dan reusable UI blocks
|   `-- layout/             // Shared layout components
|-- hooks/                  // Shared hooks lintas modul
|-- icons/                  // Icon components/assets
|-- lib/
|   |-- auth/               // Session, path, password verifier, auth hooks
|   |-- errors/             // ApiError + getErrorMessage
|   |-- home/               // Logic helper home/simulator
|   |-- http/               // HTTP helper khusus tambahan (jika ada)
|   |-- utils/              // Utility umum
|   `-- validations/        // Shared validations (jika dipakai)
|-- providers/              // Query provider, sidebar provider, toaster provider
|-- schemas/                // Schema Zod + seeder auth
|-- services/               // fetcher, gas-client, attendance-gas-service
|-- stores/                 // Zustand store(s)
|-- types/                  // Shared types
`-- utils/                  // Utility domain-level (contoh: utils/home/*)
```

Catatan penting
- Jangan gunakan `src/features/*` sebagai standar default karena arsitektur aktif tidak memakai pola itu.
- Jangan membuat `src/app/api/*` sebagai default transport untuk modul ini.

3. Routing dan konvensi App Router
Route canonical saat ini
- `/` -> landing page (site shell + home content)
- `/login` -> halaman login
- `/dashboard`
- `/dashboard/dosen/*`
- `/dashboard/mahasiswa/*`

Konvensi file
- Gunakan `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` seperlunya.
- Route dashboard sudah final dengan pola flatten:
  - `src/app/dashboard/dosen/...`
  - `src/app/dashboard/mahasiswa/...`
- `src/app/dashboard/layout.tsx` adalah entry layout dashboard (auth guard + shell).

4. Aturan dasar coding
- Gunakan nama yang deskriptif dan early return.
- Hapus import yang tidak dipakai.
- Gunakan alias `@/` untuk import lintas modul.
- Relative import boleh untuk scope dekat (`./`, `../`) yang masih jelas.
- Hindari relative import berlapis dalam (`../../..`) bila bisa pakai alias.
- Hindari TODO tanpa referensi issue/ticket.

Komentar kode
- Default tanpa komentar.
- Komentar hanya untuk constraint non-obvious yang tidak terbaca dari kode.

5. Komponen dan view layer
- Gunakan `.tsx` untuk file JSX, `.ts` untuk non-JSX.
- Server Component adalah default.
- Tambahkan `"use client"` hanya saat butuh state/effect/event/browser API/client hook.

Kategori komponen
- `src/components/ui/*`: primitives dan reusable UI elements.
- `src/components/layout/*`: layout reusable.
- `src/app/**`: komponen yang terikat route segment.

Catatan penting UI
- Jangan berasumsi selalu ada barrel `@/components/ui`.
- Jika primitive global belum tersedia, komponen input kecil boleh inline di route file dengan tipe jelas.

6. Lokasi hooks
- `src/hooks/*`: shared hooks lintas modul.
- `src/lib/auth/use-auth-session.ts`: hook auth client untuk session saat ini.
- Route-specific hook boleh colocated di segment route bila scope benar-benar lokal.

Aturan
- Jangan bungkus logic server-side sebagai React hook client.
- Gunakan hook hanya untuk kebutuhan composability UI/client state.

7. Data fetching dan API layer (standar GAS)
Pola wajib 3 layer
1) `services/fetcher.ts` untuk HTTP transport + error normalization.
2) `services/gas-client.ts` untuk build URL GAS + method transport.
3) `services/attendance-gas-service.ts` untuk kontrak endpoint domain.

Aturan integrasi GAS
- Base URL diambil dari `NEXT_PUBLIC_GAS_BASE_URL`.
- Untuk POST direct ke GAS:
  - gunakan `Content-Type: text/plain;charset=UTF-8`
  - body tetap `JSON.stringify(payload)`
- Tujuan: hindari preflight `OPTIONS` CORS pada GAS Web App.
- Jangan menjadikan Next.js API proxy sebagai default flow modul ini.

Endpoint domain presensi saat ini
- `/presence/qr/generate`
- `/presence/checkin`
- `/presence/status`
- `/presence/list`

8. Error handling
- Gunakan `ApiError` untuk error HTTP di service layer.
- Jangan throw string.
- Di UI, tampilkan pesan dengan `getErrorMessage(error)`.

Prinsip
- Error user-facing harus ringkas dan konsisten.
- Error teknis detail tetap bisa dilihat dari response/log bila dibutuhkan.

9. Form handling
- Semua form memakai React Hook Form.
- Validasi memakai Zod (`schemas/*` atau lokasi relevan).
- Gunakan resolver `zodResolver`.
- Untuk nilai numerik dari input text, gunakan coercion yang eksplisit.

10. Client state dan Zustand
- Zustand dipakai untuk UI state, bukan server cache.
- Server data tetap di TanStack Query atau state lokal terkontrol.
- Provider/state setup harus aman untuk App Router client behavior.

11. Auth system (client-only simple auth)
Standar auth saat ini
- Seeder akun: `src/schemas/seeder.ts`
- Login schema: `src/schemas/login.schema.ts`
- Verifikasi password: `src/lib/auth/password.ts`
  - mendukung bcrypt hash
  - mendukung PBKDF2 fallback bila diperlukan
- Session storage: `src/lib/auth/session.ts` (`sessionStorage`)
- Guard dashboard: `src/app/login/components/dashboard-auth-guard.tsx`

Larangan default
- Jangan migrasikan ke Auth.js, DB auth, atau server auth tanpa keputusan arsitektur baru.

Batasan keamanan
- Pola ini untuk demo/internal practical flow.
- Bukan baseline security production-grade.

12. Styling dan design tokens
- Gunakan token/CSS variables yang sudah ada (`--token-*`, `--color-*`).
- Hindari hardcode warna jika sudah ada token setara.
- Konsistenkan class naming dengan pola halaman home/dashboard yang aktif.

13. Metadata dan SEO
- Gunakan Metadata API di `layout.tsx`/`page.tsx` server component.
- Dalam satu segment, gunakan salah satu:
  - `export const metadata`
  - atau `generateMetadata`

14. Konvensi TypeScript
- Gunakan `type` sebagai default untuk props/object unions.
- Gunakan `interface` hanya saat benar-benar butuh declaration merging/extends kontrak.
- Tetap strict: hindari `any`, gunakan narrowing/unknown dengan benar.

15. Testing dan quality gate
Wajib sebelum finalisasi perubahan
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit` (jika area terkait punya test)

Jika struktur route berubah
- Jalankan `npx next typegen` untuk refresh route types saat `.next/types` stale.

16. Deployment dan env
Frontend env utama saat ini
- `NEXT_PUBLIC_GAS_BASE_URL`

Aturan env
- Jangan hardcode URL sensitif di source code.
- Commit hanya `.env.example`, bukan `.env` real.

17. Dependencies
- Hindari pin `latest` mentah.
- Gunakan versi yang kompatibel dengan lockfile repo.
- Pisahkan `dependencies` dan `devDependencies` dengan benar.

18. Checklist sebelum coding
1. Baca pola existing di repo, lalu ikuti pola itu dahulu.
2. Pilih perubahan minimal dengan dampak terkendali.
3. Pastikan aturan route, auth, dan service layer tetap konsisten.
4. Jalankan quality gate yang relevan.
5. Tulis ringkasan singkat: apa yang benar, apa yang diubah, dan alasannya.
````
