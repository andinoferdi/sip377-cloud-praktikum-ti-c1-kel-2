# CloudTrack Campus Frontend

Frontend ini memakai Next.js App Router dan berfungsi sebagai client untuk memanggil backend Google Apps Script (GAS) secara langsung.

## Prasyarat

- Node.js 20+
- npm 10+

## Environment Variable

Gunakan file `.env` di folder `frontend/`.

```env
NEXT_PUBLIC_GAS_BASE_URL="https://script.google.com/macros/s/AKfycbzHGH188OZrr8HKf7rlp-wrJIu2KJBq4mEUVsIqPQ3_f4DyV4kL93MDNumD14ynVt9Khw/exec"
```

Catatan:

1. `NEXT_PUBLIC_GAS_BASE_URL` harus mengarah ke URL deployment Web App GAS yang berakhiran `/exec`.
2. Jika variabel ini kosong, halaman Modul 1 tetap berjalan dalam mode mock lokal.
3. Request `POST` ke GAS dikirim sebagai `Content-Type: text/plain;charset=UTF-8` untuk menghindari preflight CORS browser pada Web App GAS.

## Menjalankan Aplikasi

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Validasi

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

## Arsitektur Singkat

1. UI aktif fokus pada Modul 1 Presensi QR Dinamis.
2. Tidak ada ORM Prisma, auth internal DB, atau API internal Next.js.
3. Integrasi backend menggunakan direct REST call ke GAS dari client.
