# Standar Adjudikasi Konflik Rules vs Implementasi (Runtime+Tests-First)

Dokumen ini adalah kerangka keputusan resmi saat terjadi konflik `A (rules)` vs `A1 (implementasi)`.

## 1. Tujuan

1. Menyelesaikan konflik lintas tim secara konsisten, cepat, dan bisa diaudit.
2. Menetapkan sumber kebenaran sementara berdasarkan bukti teknis paling kuat.
3. Memastikan sinkronisasi dokumen setelah keputusan diambil.

## 2. Urutan Prioritas Keputusan

Urutan prioritas wajib:

1. `Runtime behavior aktual`
2. `Automated tests` (unit/e2e/smoke)
3. `OpenAPI/kontrak aktif`
4. `Code rules` (backend/frontend)
5. `README/dokumen lain`

Aturan eksekusi:

1. Jika ada konflik antar level, level yang lebih tinggi menang sementara.
2. Keputusan tidak berhenti di override sementara. Harus ada aksi sinkronisasi artefak level bawah.
3. Untuk kasus `Critical/High`, sinkronisasi harus terjadi pada perubahan yang sama atau batch terjadwal dengan deadline jelas.

## 3. Workflow Adjudikasi

Langkah wajib:

1. Deteksi konflik.
2. Klasifikasi severity.
3. Evaluasi bukti.
4. Pilih keputusan final.
5. Catat di Matrix Keputusan.
6. Jadwalkan dan jalankan sinkronisasi.

Definisi severity:

1. `Critical`: memengaruhi kontrak publik atau kompatibilitas lintas tim.
2. `High`: memengaruhi flow user utama atau hasil test utama.
3. `Medium`: memengaruhi perilaku internal non-breaking.
4. `Low`: style, wording, atau teknis minor non-breaking.

## 4. Bukti Minimum yang Wajib

Setiap keputusan harus punya bukti minimal:

1. Potongan behavior runtime aktual.
2. Hasil test terkait (unit/e2e/smoke).
3. Rujukan kontrak aktif (OpenAPI/kontrak endpoint).

Jika bukti belum lengkap, status keputusan adalah `pending` dan tidak boleh dianggap final.

## 5. Matrix Keputusan Standar

Gunakan format tabel berikut untuk setiap konflik:

| Area | Konflik | A (Rules) | A1 (Implementasi) | Opsi | Keputusan | Alasan | Dampak | Aksi Sinkronisasi | Owner | Deadline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| contoh: Presence | token single-use vs multi-user | single-use | multi-user sampai session stop | revert / pertahankan / hybrid | pertahankan A1 | selaras runtime + test + kontrak aktif | perubahan docs lintas tim | update rules + README + OpenAPI example | BE Lead | 2026-03-15 |

Template copy-paste:

```md
| Area | Konflik | A (Rules) | A1 (Implementasi) | Opsi | Keputusan | Alasan | Dampak | Aksi Sinkronisasi | Owner | Deadline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |
```

## 6. Quality Gate Governance

Kebijakan PR wajib:

1. PR wajib menjawab: ada/tidak konflik `A vs A1`.
2. Jika ada konflik, PR wajib menyertakan link Matrix Keputusan.
3. PR wajib menyertakan bukti test/regresi yang dipakai untuk keputusan.
4. Untuk endpoint publik, smoke test modul terkait wajib dilampirkan.
5. Merge ditolak jika kontrak publik berubah tanpa Matrix Keputusan dan acceptance test relevan.

## 7. Baseline Matrix Awal

Konflik awal yang harus dicatat dan dipantau:

| Area | Konflik | A (Rules) | A1 (Implementasi) | Opsi | Keputusan | Alasan | Dampak | Aksi Sinkronisasi | Owner | Deadline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Presensi | Token multi-user | token dipakai sekali | token bisa dipakai banyak user sampai stop sesi | revert / pertahankan | pertahankan implementasi aktif | runtime + smoke test presensi mengikuti multi-user | update acuan rules yang belum sinkron | sinkronkan rules backend dan contoh kontrak | BE Lead | 2026-03-16 |
| Presensi | Endpoint tambahan | daftar endpoint rules tidak lengkap | ada endpoint tambahan aktif untuk operasi presensi | rollback / dokumentasikan | dokumentasikan endpoint aktif | mencegah drift FE-BE | perubahan kontrak lintas tim | update OpenAPI + README + smoke test list | BE Lead | 2026-03-16 |
| Error Handling | Error taxonomy aktif | taxonomy minimum lama | runtime menggunakan kode error aktif yang lebih luas | revert / adopsi | adopsi runtime aktif | menjaga kompatibilitas client berjalan | update parser FE dan dokumen QA | sinkronkan code rules + dokumentasi error | FE+BE Lead | 2026-03-17 |
| Sheet Storage | Penambahan sheet state/config | rules lama menyebut sheet minimum terbatas | runtime memakai sheet state/config tambahan | hapus / pertahankan | pertahankan runtime aktif | dibutuhkan untuk kontrol sesi dan konfigurasi | perlu update standar sheet wajib | sinkronkan aturan schema sheet | BE Lead | 2026-03-16 |
| Dokumentasi | Drift minor wording/urutan | wording antar dokumen berbeda | implementasi tetap konsisten | abaikan / rapikan | rapikan bertahap | menurunkan salah tafsir reviewer | beban dokumentasi ringan | batch per sprint dokumentasi | Docs Owner | 2026-03-20 |

## 8. Test Plan Governance (Proses)

1. Simulasikan 3 konflik nyata: backend kontrak, error code, frontend integration.
2. Verifikasi tiap kasus menghasilkan Matrix Keputusan lengkap.
3. Simulasikan PR `High` tanpa matrix, hasil review harus ditolak.
4. Simulasikan PR dengan matrix + bukti test, hasil review harus lolos.
5. Verifikasi konsistensi keputusan reviewer untuk kasus identik dengan policy yang sama.
