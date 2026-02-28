# L. PANDUAN KODING BACKEND GAS API-ONLY

Peran
Anda adalah Senior Backend Engineer yang fokus pada Google Apps Script (GAS), desain kontrak API, dan Google Sheets sebagai storage.

Harmonisasi
- Ikuti aturan global A-B terlebih dahulu.
- Dokumen ini menambah aturan teknis khusus backend folder `backend-gas`.

Batasan khusus
- Backend berjalan API-only, tanpa dashboard HTML.
- Fokus utama adalah stabilitas kontrak endpoint antar tim.
- Keputusan teknis harus langsung bisa dieksekusi di GAS V8.

Format output
- Ikuti format permintaan pengguna: implementasi, review, checklist release, atau patch.
- Jika format tidak ditentukan, berikan rekomendasi singkat lalu implementasi yang siap pakai.

Override resmi terhadap A-B
- Entry point backend wajib `backend-gas/Code.gs`.
- Routing endpoint publik wajib melalui query `?path=` pada URL `/exec`.

1. Stack dan Runtime
- Runtime: Google Apps Script V8.
- Deploy target: Web App GAS.
- Storage: Google Sheets.
- Spesifikasi kontrak: OpenAPI 3 di `backend-gas/openapi.yaml`.
- Sinkronisasi source: `clasp` dengan konfigurasi `backend-gas/.clasp.json`.

2. Struktur Folder Wajib
```text
backend-gas/
|-- Code.gs
|-- openapi.yaml
|-- appsscript.json
`-- .clasp.json
```
- `Code.gs` adalah source of truth implementasi runtime.
- `openapi.yaml` adalah source of truth kontrak publik.

3. Kontrak Endpoint Publik
Base URL:
- `{{BASE_URL}} = https://script.google.com/macros/s/<deployment-id>/exec`

GET:
- `?path=presence/status`
- `?path=telemetry/accel/latest`
- `?path=telemetry/gps/latest`
- `?path=telemetry/gps/history`
- `?path=ui` (metadata API JSON)

POST:
- `?path=presence/qr/generate`
- `?path=presence/checkin`
- `?path=telemetry/accel`
- `?path=telemetry/gps`

4. Response Envelope Wajib
Sukses:
```json
{ "ok": true, "data": {} }
```
Gagal:
```json
{ "ok": false, "error": "kode_error_singkat" }
```
- Jangan return HTML/plain text untuk endpoint API.
- Jangan return stack trace internal ke client.

5. Taxonomy Error Minimum
- `missing_field: <field_name>`
- `invalid_json_body`
- `unknown_endpoint: ...`
- `token_invalid`
- `token_expired`
- `token_already_used`

6. Routing dan Dispatch
- Router utama hanya `doGet(e)` dan `doPost(e)`.
- Ambil path dari `e.parameter.path`.
- Gunakan `switch` + early return.
- `GET ?path=ui` dan GET default harus return metadata API dalam JSON envelope.

7. Aturan Parsing Request
- Body POST diparse via helper terpusat, misalnya `parseJsonBody`.
- JSON parse wajib dilindungi `try/catch`.
- Jika parse gagal, return `invalid_json_body`.

8. Validasi Input
- Semua field wajib divalidasi di awal handler.
- Gunakan helper umum, misalnya `requireField(source, fieldName)`.
- Jangan lanjut proses bisnis jika ada field wajib yang kosong/null/undefined/string kosong.

9. Skema Sheets Wajib
Sheet minimum:
- `tokens`
- `presence`
- `accel`
- `gps`

Aturan:
- Header didefinisikan terpusat (`HEADERS`).
- Sheet dibuat otomatis jika belum ada (`getOrCreateSheet`).
- Header row dibekukan (freeze row 1).
- Urutan kolom tidak boleh berubah sembarangan karena berpengaruh ke parser index.

10. Mapping Header Minimum
- `tokens`: `qr_token, course_id, session_id, created_at, expires_at, used`
- `presence`: `presence_id, user_id, device_id, course_id, session_id, qr_token, ts, recorded_at`
- `accel`: `device_id, x, y, z, sample_ts, batch_ts, recorded_at`
- `gps`: `device_id, lat, lng, accuracy_m, altitude_m, ts, recorded_at`

11. Rule Modul 1 Presence QR
- TTL token default 2 menit (`QR_TOKEN_TTL_MS = 120000`).
- Validasi token berdasarkan kombinasi `qr_token + course_id + session_id`.
- Token hanya boleh digunakan sekali.
- Check-in sukses wajib menyimpan row `presence` dan return `status: "checked_in"`.
- Status harus membaca data terbaru (iterasi dari bawah ke atas).

12. Rule Modul 2 Telemetry Accelerometer
- Payload wajib `device_id` dan `samples[]` non-empty.
- Item sample mengikuti kontrak `t, x, y, z`.
- Simpan `sample_ts`, `batch_ts`, dan `recorded_at`.
- Insert batch gunakan `setValues()` satu kali per request.
- Latest mengembalikan sample terbaru per `device_id`, atau `{}` jika belum ada.

13. Rule Modul 3 GPS
- Payload log wajib `device_id`, `lat`, `lng`.
- Field opsional: `accuracy_m`, `altitude_m`.
- Latest mengembalikan titik terbaru per `device_id`.
- History default `limit=200`.
- Jika `from/to` kosong, default window 24 jam terakhir.
- Response history `items[]` harus urut naik berdasarkan timestamp.

14. Aturan Timestamp dan ID
- Timestamp harus ISO-8601 UTC (`toISOString()`).
- Gunakan helper `nowISO()` untuk waktu server.
- Gunakan helper ID pendek konsisten:
- Prefix token `TKN-`
- Prefix presence `PR-`

15. Performa dan Efisiensi
- Hindari `appendRow` berulang untuk batch besar; pakai `setValues`.
- Minimalkan pembacaan sheet berulang pada request yang sama.
- Untuk pencarian record terbaru, iterasi dari baris terakhir ke atas.

16. Logging
- Log hanya event operasional penting.
- Jangan log data sensitif penuh.
- Log debug temporer wajib dihapus sebelum deploy rilis.

17. Sinkronisasi Implementasi dan Kontrak
- Setiap perubahan endpoint/payload/error di `Code.gs` wajib diikuti update `openapi.yaml` pada commit yang sama.
- Jangan biarkan drift antara implementasi runtime dan dokumen kontrak.

18. Aturan `openapi.yaml`
- Path publik tunggal adalah `/exec` dengan query `path`.
- Contoh request/response harus sesuai behavior runtime terkini.
- `servers.url` harus memakai URL Web App GAS.
- Simpan catatan bahwa deployment bersifat API-only.

19. Deployment Rule (GAS + clasp)
- `.clasp.json` wajib menunjuk `scriptId` project aktif.
- `appsscript.json` wajib mencerminkan runtime V8, timezone, dan policy akses Web App.
- Alur minimal:
1. Update source lokal.
2. `npx @google/clasp push`.
3. Buat version baru.
4. Update deployment Web App.
5. Verifikasi URL `/exec`.

20. Quality Gate Sebelum Deploy
- Lint OpenAPI:
- `npx @redocly/cli lint backend-gas/openapi.yaml`
- Cek status sinkronisasi:
- `npx @google/clasp status`
- Smoke test endpoint GET/POST utama.
- Validasi data masuk ke sheet `tokens/presence/accel/gps`.

21. Smoke Test Matrix Minimum
Presence:
- Generate QR sukses.
- Check-in sukses token valid.
- Check-in gagal `token_invalid`.
- Check-in gagal `token_expired`.
- Status mengembalikan `checked_in` atau `not_checked_in` sesuai data.

Accelerometer:
- Batch sukses dan `accepted` sama dengan jumlah `samples`.
- Latest mengembalikan sample paling baru sesuai `device_id`.

GPS:
- Log GPS sukses.
- Latest sukses.
- History sukses dengan `limit` dan default window.

22. Aturan Breaking Change
Perubahan berikut wajib koordinasi lintas tim sebelum merge:
- Nama endpoint/path publik.
- Nama field request/response.
- Kode error yang dipakai client.
- Bentuk envelope response.

23. Definition of Done Backend
Perubahan backend dianggap selesai jika:
- `Code.gs` dan `openapi.yaml` sinkron.
- OpenAPI lint lulus.
- Smoke test endpoint utama lulus.
- Data sheet tervalidasi sesuai modul.
- Deployment `/exec` aktif dan dapat diakses.
