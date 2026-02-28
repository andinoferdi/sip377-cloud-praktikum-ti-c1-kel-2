# SIP377 Cloud Praktikum TI C1 Kel 2

Panduan utama kolaborasi tim Frontend, Backend, QA, dan Dokumentasi untuk project CloudTrack Campus.

## 1. Ringkasan Sistem

CloudTrack Campus menggunakan arsitektur monorepo:

1. Frontend: Next.js App Router di folder `frontend/`.
2. Backend: Google Apps Script (GAS) API-only di folder `backend-gas/`.
3. Penyimpanan backend: Google Spreadsheet.
4. Integrasi FE -> BE: direct call dari browser ke GAS Web App (`/exec?path=...`).

Base URL deployment aktif saat ini:

`https://script.google.com/macros/s/AKfycbzwGB2egCMblZrIQUQJketAhlABHr5jde6JoBAwdY6RhiuLlcs3Wzm1C71cQykB-awqEw/exec`

## 2. Struktur Repo

```text
.
|-- frontend/        # Next.js client app
|-- backend-gas/     # GAS source + OpenAPI + clasp config
|-- docs/            # Dokumen operasional tambahan
|-- postman/         # Koleksi Postman (saat ini placeholder)
|-- scripts/         # Script utilitas git flow
|-- chat-rules.md
|-- code-rules-fe.md
|-- code-rules-be.md
`-- README.md        # Dokumen utama ini
```

## 3. Branch Strategy dan Alur Merge

Branch integrasi:

1. `main`: branch rilis stabil.
2. `fe`: branch integrasi frontend.
3. `be`: branch integrasi backend.
4. `test`: branch integrasi QA.

Alur merge wajib:

1. `feature/*` atau `fix/*` -> `fe` atau `be`.
2. `fe` dan/atau `be` -> `test`.
3. `test` -> `main`.

Referensi detail:

`docs/git-workflow.md`

## 4. Panduan Frontend Developer

### 4.1 Prasyarat

1. Node.js 20+.
2. npm 10+.

### 4.2 Setup lokal

```bash
cd frontend
npm install
cp .env.example .env
```

Isi `frontend/.env`:

```env
NEXT_PUBLIC_GAS_BASE_URL="https://script.google.com/macros/s/AKfycbzwGB2egCMblZrIQUQJketAhlABHr5jde6JoBAwdY6RhiuLlcs3Wzm1C71cQykB-awqEw/exec"
```

Jalankan aplikasi:

```bash
npm run dev
```

### 4.3 Quality gate frontend

Wajib jalan sebelum PR:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

### 4.4 Aturan teknis frontend

1. Ikuti standar di `code-rules-fe.md`.
2. Tetap pakai service layer:
   1. `src/services/fetcher.ts`
   2. `src/services/gas-client.ts`
   3. `src/services/attendance-gas-service.ts`
3. Jangan hardcode URL GAS di source code.
4. Jika menambah atau mengubah endpoint yang dipakai UI, koordinasi dengan backend dan update dokumentasi.

### 4.5 Checklist PR frontend

1. Branch source dari `fe`.
2. Scope PR jelas dan kecil.
3. Tidak ada `.env` atau secret ter-commit.
4. Semua quality gate lulus.
5. Jika mengubah flow API, update README atau dokumen terkait.

## 5. Panduan Backend Developer (GAS)

### 5.1 Prasyarat

1. Node.js + npm.
2. `@google/clasp` (via `npx` atau global install).
3. Akses edit ke Apps Script project dan Spreadsheet.

### 5.2 Source of truth backend

1. Implementasi runtime: `backend-gas/Code.gs`.
2. Kontrak API: `backend-gas/openapi.yaml`.
3. Manifest GAS: `backend-gas/appsscript.json`.
4. Konfigurasi clasp: `backend-gas/.clasp.json`.

### 5.3 Endpoint publik aktif

GET:

1. `?path=presence/status`
2. `?path=presence/list`
3. `?path=telemetry/accel/latest`
4. `?path=telemetry/gps/latest`
5. `?path=telemetry/gps/history`
6. `?path=ui`

POST:

1. `?path=presence/qr/generate`
2. `?path=presence/checkin`
3. `?path=presence/qr/stop`
4. `?path=telemetry/accel`
5. `?path=telemetry/gps`

Response envelope wajib:

```json
{ "ok": true, "data": {} }
```

```json
{ "ok": false, "error": "error_code" }
```

### 5.4 Aturan bisnis presensi saat ini

1. Satu token bisa dipakai banyak mahasiswa selama sesi belum di-stop.
2. Mahasiswa yang sama tidak boleh check-in dua kali di sesi yang sama (`already_checked_in`).
3. Stop sesi dikontrol oleh sheet `session_state` (`is_stopped=true`).
4. Jika sesi sudah stop, check-in baru harus gagal dengan `session_closed`.
5. `tokens.used` dipertahankan untuk kompatibilitas struktur lama, bukan blocker utama check-in.

### 5.5 Struktur sheet yang harus ada

`tokens`:
`qr_token, course_id, session_id, created_at, expires_at, used`

`presence`:
`presence_id, user_id, device_id, course_id, session_id, qr_token, ts, recorded_at`

`accel`:
`device_id, x, y, z, sample_ts, batch_ts, recorded_at`

`gps`:
`device_id, lat, lng, accuracy_m, altitude_m, ts, recorded_at`

`session_state`:
`course_id, session_id, is_stopped, started_at, stopped_at, updated_at`

### 5.6 Deploy backend via clasp

Contoh alur:

```bash
cd backend-gas
npx @google/clasp status
npx @google/clasp push
```

Setelah `push`, buat version baru dan update deployment Web App dari Apps Script UI.

### 5.7 Checklist PR backend

1. Branch source dari `be`.
2. `Code.gs` dan `openapi.yaml` sinkron.
3. Error code konsisten dengan frontend.
4. Smoke test endpoint utama lulus.
5. Tidak ada perubahan breaking tanpa koordinasi lintas tim.

## 6. Panduan QA

### 6.1 Scope QA minimum per rilis

1. Flow presensi QR dosen dan mahasiswa.
2. Telemetry accel dan GPS.
3. Regression login/dashboard flow frontend.
4. Konsistensi data di spreadsheet.

### 6.2 Test environment checklist

1. URL FE hosting (Vercel) aktif.
2. URL GAS deployment benar dan sudah di-set ke env FE.
3. Spreadsheet aktif memiliki 5 sheet wajib.
4. Minimal 2 browser mobile Android untuk uji scan.

### 6.3 Automated checks (frontend)

```bash
cd frontend
npm install
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

### 6.4 Manual smoke test presensi (wajib)

1. Dosen generate QR sesi baru.
2. Mahasiswa A scan/check-in berhasil.
3. Mahasiswa B scan token sesi yang sama juga berhasil.
4. Mahasiswa A check-in lagi pada sesi sama gagal `already_checked_in`.
5. Dosen tekan stop sesi.
6. Mahasiswa C check-in setelah stop gagal `session_closed`.

### 6.5 Manual smoke test telemetry

1. POST accel batch berhasil, `accepted` sesuai jumlah sampel.
2. GET accel latest mengembalikan data terbaru sesuai `device_id`.
3. POST GPS berhasil.
4. GET GPS latest dan history mengembalikan data valid.

### 6.6 Defect reporting format

Saat membuat bug report, wajib isi:

1. Ringkasan bug.
2. Build/commit dan branch.
3. Environment (browser, device, URL FE, URL GAS).
4. Langkah reproduksi.
5. Expected vs actual result.
6. Screenshot/video dan log error.
7. Severity (critical/high/medium/low).

## 7. Panduan Tim Dokumentasi

### 7.1 Kapan dokumen wajib diperbarui

1. Ada endpoint baru, perubahan payload, atau error code.
2. Ada perubahan flow bisnis (contoh: token multi-user, stop session).
3. Ada perubahan setup env/deploy.
4. Ada perubahan alur QA atau workflow Git.

### 7.2 File yang harus disinkronkan

1. `README.md` (dokumen lintas tim).
2. `frontend/README.md` (setup dan flow frontend).
3. `backend-gas/openapi.yaml` (kontrak API publik).
4. `docs/git-workflow.md` (alur branch/PR).
5. `code-rules-fe.md` dan `code-rules-be.md` jika ada perubahan standar teknis.

### 7.3 Standar kualitas dokumentasi

1. Instruksi harus executable, bukan deskriptif umum.
2. Semua URL contoh gunakan URL deployment terbaru.
3. Hindari kontradiksi antar dokumen.
4. Sertakan tanggal/perubahan penting pada PR description.

## 8. Runbook Ganti URL GAS Deployment

Saat backend deploy ke URL baru:

1. Update `frontend/.env` lokal.
2. Update env `NEXT_PUBLIC_GAS_BASE_URL` di Vercel project.
3. Redeploy frontend hosting.
4. Update contoh URL di `frontend/README.md`.
5. Update `servers.variables.deploymentId.default` di `backend-gas/openapi.yaml`.
6. Jalankan smoke test presensi end-to-end.

## 9. Troubleshooting Singkat

1. Scan kamera aktif tapi check-in gagal:
   1. Cek payload QR hasil scan.
   2. Cek response error code dari GAS.
   3. Cek status sesi di sheet `session_state`.
2. Semua check-in ditolak `session_closed`:
   1. Verifikasi dosen belum menekan stop.
   2. Periksa baris `is_stopped` untuk `course_id + session_id` terkait.
3. FE berhasil lokal tapi gagal di hosting:
   1. Pastikan env Vercel sudah update.
   2. Lakukan redeploy setelah update env.

## 10. Definition of Done Lintas Tim

Perubahan dianggap selesai jika:

1. Kode merged ke branch integrasi yang benar.
2. Quality gate lulus.
3. QA smoke test lulus tanpa blocker kritis.
4. Dokumentasi utama sudah diperbarui.
5. Perubahan sudah tersinkron ke `main` sesuai alur release.
