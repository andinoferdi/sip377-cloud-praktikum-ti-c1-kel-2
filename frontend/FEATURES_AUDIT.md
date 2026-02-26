# FEATURES AUDIT

## Snapshot

Project aktif sudah dipangkas menjadi frontend client-only untuk CloudTrack Campus dengan fokus Modul 1 Presensi QR Dinamis.

## Status Arsitektur

1. Frontend: Next.js App Router, React, TypeScript strict, Tailwind CSS v4.
2. Data flow: direct call ke backend GAS melalui `NEXT_PUBLIC_GAS_BASE_URL`.
3. Runtime lokal: mode mock untuk simulasi jika URL GAS belum diisi.
4. Tidak ada Prisma, tidak ada auth internal berbasis database, dan tidak ada API internal Next.js.

## Fitur Aktif

1. Landing single-page untuk Modul 1.
2. Simulasi generate token, check-in, dan cek status.
3. Toggle mode mock dan mode direct GAS.
4. Branding aktif: CloudTrack Campus.

## Yang Sudah Dihapus

1. Seluruh `src/app/api/**`.
2. Seluruh jejak Prisma pada source aktif.
3. Auth dan RBAC internal yang bergantung database.
4. Arsip UI lama di `legacy-ui`.

## Konsekuensi

1. Endpoint internal Next.js tidak lagi tersedia.
2. Frontend harus mendapatkan respons dari GAS atau fallback ke mock.
3. Deployment frontend cukup mengatur env publik untuk base URL GAS.
