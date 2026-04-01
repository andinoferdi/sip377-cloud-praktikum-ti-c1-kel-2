# CloudTrack Campus Frontend

Frontend ini memakai Next.js App Router dan berfungsi sebagai client untuk memanggil backend Google Apps Script (GAS) secara langsung.

## Prasyarat

- Node.js 20+
- npm 10+

## Environment Variable

Gunakan file `frontend/.env.local`.

```env
NEXT_PUBLIC_GAS_BASE_URL="https://script.google.com/macros/s/AKfycbzEaMmA6eoRqKPKvQTEphehaVDIMaZKgGpoN6obi8SltQln9pDbcO0M0QD0HhIuPUL2uQ/exec"
```

Catatan:

1. `NEXT_PUBLIC_GAS_BASE_URL` harus mengarah ke URL deployment Web App GAS yang berakhiran `/exec`.
2. Jika variabel ini kosong, halaman Modul 1 tetap berjalan dalam mode mock lokal.
3. Request `POST` ke GAS dikirim sebagai `Content-Type: text/plain;charset=UTF-8` untuk menghindari preflight CORS browser pada Web App GAS.
4. Saat mode swap test, endpoint bisa diganti saat runtime via panel `Swap Control` (pojok kanan bawah) tanpa rebuild.
5. Hindari menaruh variabel frontend hanya di root `.env` karena bisa membuat status backend SSR dan client tidak konsisten.

Troubleshooting hydration swap:

1. Jika muncul pesan `Hydration failed`, pastikan `NEXT_PUBLIC_GAS_BASE_URL` ada di `frontend/.env.local` dengan format URL murni.
2. Jika panel swap pernah menyimpan data lama, klik `Reset` di `Swap Control`, lalu refresh halaman.

## Menjalankan Aplikasi

```bash
npm install
npm run docs:prepare
npm run dev
```

Buka `http://localhost:3000`.
Dokumentasi API interaktif tersedia di `http://localhost:3000/docs`.
Halaman publik Modul 2 tersedia di:
`http://localhost:3000/accelerometer` (redirect ke receiver),
`http://localhost:3000/accelerometer/receiver`,
dan `http://localhost:3000/accelerometer/sender`.
Halaman publik Modul 3 tersedia di:
`http://localhost:3000/gps` (redirect ke sender),
`http://localhost:3000/gps/sender`,
dan `http://localhost:3000/gps/map`.

## Swagger Docs (`/docs`)

Frontend menayangkan Swagger UI di route publik `/docs`.
Source of truth spesifikasi API adalah `backend-gas/openapi.yaml`.
File yang dilayani frontend adalah `frontend/public/openapi.yaml` hasil sinkronisasi.
File `frontend/public/openapi-modul-1.json` dan `frontend/public/openapi-modul-2.json` adalah artefak turunan otomatis dari source of truth backend.
Asset Swagger UI statis dilayani dari `frontend/public/docs/*`.

Perintah persiapan docs:

```bash
npm run docs:prepare
```

Perintah sinkronisasi spesifikasi OpenAPI:

```bash
npm run docs:sync-openapi
```

Perintah generate artefak OpenAPI modul:

```bash
npm run docs:sync-openapi-modules
```

Perintah sinkronisasi asset Swagger UI statis:

```bash
npm run docs:sync-swagger-ui-assets
```

Perintah verifikasi sinkronisasi:

```bash
npm run docs:check-openapi-sync
npm run docs:check-openapi-modules-sync
npm run docs:check-swagger-ui-assets
```

Smoke test kontrak Modul 1 (langsung ke GAS):

```bash
npm run qa:modul1:api-smoke
```

Smoke test kontrak Modul 2 realtime:

```bash
npm run qa:modul2:api-smoke
```

Smoke test rehearsal swap lintas endpoint:

```bash
OWN_BASE_URL="https://script.google.com/macros/s/.../exec" PARTNER_BASE_URL="https://script.google.com/macros/s/.../exec" npm run qa:swap:rehearsal
```

Output bukti otomatis:

1. `frontend/.qa-artifacts/swap-rehearsal/latest.json`
2. `frontend/.qa-artifacts/swap-rehearsal/latest.md`

Catatan:

1. Swap test nyata mensyaratkan `OWN_BASE_URL` dan `PARTNER_BASE_URL` berbeda.
2. Jika hanya rehearsal internal, tambahkan `ALLOW_SAME_BASE_URL=1`.

E2E UI Modul 1 (Playwright):

```bash
npm run test:e2e:qr
```

E2E UI Modul 3 (Playwright):

```bash
npm run test:e2e:gps
```

## Governance Konflik Rules vs Implementasi

Jika terjadi konflik antara rules dan implementasi aktif, gunakan standar adjudikasi lintas tim di:

`../docs/rule-conflict-adjudication.md`

Prioritas keputusan: runtime aktual, hasil test, kontrak aktif, code rules, lalu dokumen pendukung.

## Validasi

```bash
npm run qa:modul1:prepr
```

Urutan detail command:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e:qr
npm run qa:modul1:api-smoke
npm run qa:modul2:api-smoke
npm run build
npm run repo:check-protected-files
```

## Proteksi File Patokan

Daftar file patokan yang tidak boleh terhapus ada di:

`../scripts/protected-files.allowlist`

Checker:

```bash
npm run repo:check-protected-files
```

## Akun QA Seed (Modul 1)

Gunakan akun berikut untuk pengujian lokal:

1. Dosen
   `identifier`: `198701012020011001`
   `password`: `198701012020011001`
2. Mahasiswa
   `identifier`: `434231079`
   `password`: `434231079`
3. Mahasiswa
   `identifier`: `434231065`
   `password`: `Kediri123#`

## Arsitektur Singkat

1. UI aktif fokus pada Modul 1 Presensi QR Dinamis.
2. Modul 2 Accelerometer dipisah menjadi sender (`/accelerometer/sender`) dan receiver (`/accelerometer/receiver`), dengan receiver membaca latest + history dari backend GAS.
3. Modul 3 GPS dipisah menjadi sender (`/gps/sender`) dan map receiver (`/gps/map`), dengan map membaca latest + history dari backend GAS.
4. Tidak ada ORM Prisma, auth internal DB, atau API internal Next.js.
5. Integrasi backend menggunakan direct REST call ke GAS dari client.

## Swap Test Runtime (Presentasi)

Panel `Swap Control` tersedia global di UI (pojok kanan bawah) dan menyimpan konfigurasi ke localStorage browser.

Langkah ringkas:

1. Isi `Own GAS URL` (server kelompok sendiri) dan `Partner GAS URL` (server kelompok lawan).
2. Aktifkan mode swap.
3. Gunakan preset:
   - `Preset A`: `sender -> partner`, `visualizer -> own`.
   - `Preset B`: `sender -> own`, `visualizer -> partner`.
4. Klik `Simpan`, lalu jalankan demo modul 1-3 tanpa rebuild.
5. Pastikan saat presentasi Anda menunjukkan ringkasan endpoint aktif (sender/visualizer) di panel.

Catatan:

1. Jika partner diacak mendadak, cukup ganti `Partner GAS URL`, lalu `Simpan`.
2. Jika URL partner kosong, sistem otomatis fallback ke own URL (aman untuk rehearsal lokal).



