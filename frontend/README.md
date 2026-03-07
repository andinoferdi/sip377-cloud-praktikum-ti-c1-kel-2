# CloudTrack Campus Frontend

Frontend ini memakai Next.js App Router dan berfungsi sebagai client untuk memanggil backend Google Apps Script (GAS) secara langsung.

## Prasyarat

- Node.js 20+
- npm 10+

## Environment Variable

Gunakan file `.env` di folder `frontend/`.

```env
NEXT_PUBLIC_GAS_BASE_URL="https://script.google.com/macros/s/AKfycbzVJ1--9eMNpaPC7JcyPQsdbkOPkkKMq3PdUuFeHJKSQ5fTw7OahhjbXy1f4V0XMMeTtA/exec"
```

Catatan:

1. `NEXT_PUBLIC_GAS_BASE_URL` harus mengarah ke URL deployment Web App GAS yang berakhiran `/exec`.
2. Jika variabel ini kosong, halaman Modul 1 tetap berjalan dalam mode mock lokal.
3. Request `POST` ke GAS dikirim sebagai `Content-Type: text/plain;charset=UTF-8` untuk menghindari preflight CORS browser pada Web App GAS.

## Menjalankan Aplikasi

```bash
npm install
npm run docs:prepare
npm run dev
```

Buka `http://localhost:3000`.
Dokumentasi API interaktif tersedia di `http://localhost:3000/docs`.
Halaman publik Modul 2 realtime tersedia di `http://localhost:3000/accelerometer`.

## Swagger Docs (`/docs`)

Frontend menayangkan Swagger UI di route publik `/docs`.
Source of truth spesifikasi API adalah `backend-gas/openapi.yaml`.
File yang dilayani frontend adalah `frontend/public/openapi.yaml` hasil sinkronisasi.
Asset Swagger UI statis dilayani dari `frontend/public/docs/*`.

Perintah persiapan docs:

```bash
npm run docs:prepare
```

Perintah sinkronisasi spesifikasi OpenAPI:

```bash
npm run docs:sync-openapi
```

Perintah sinkronisasi asset Swagger UI statis:

```bash
npm run docs:sync-swagger-ui-assets
```

Perintah verifikasi sinkronisasi:

```bash
npm run docs:check-openapi-sync
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

E2E UI Modul 1 (Playwright):

```bash
npm run test:e2e:qr
```

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
2. Modul 2 Accelerometer tersedia sebagai route publik realtime dengan sesi start/stop dan buffered flush ke GAS.
3. Tidak ada ORM Prisma, auth internal DB, atau API internal Next.js.
4. Integrasi backend menggunakan direct REST call ke GAS dari client.

