# SIP377 Cloud Praktikum TI C1 Kel 2

## Struktur Folder Repo

Repositori ini memakai struktur monorepo agar frontend, backend, QA, dan dokumentasi tetap dalam satu sumber kebenaran.

```text
.
├── frontend/        # Kode Next.js
├── backend-gas/     # Kode Google Apps Script (GAS + clasp)
├── docs/            # Dokumentasi teknis dan panduan tim
├── postman/         # Koleksi Postman dan aset testing API
└── scripts/         # Script utilitas non-destruktif untuk Git workflow
```

## Branch Strategy

- `main`: branch stabil/rilis.
- `fe`: branch integrasi frontend.
- `be`: branch integrasi backend.
- `test`: branch integrasi QA/testing.

Semua branch harus tetap menyimpan struktur repo yang sama. Tidak boleh ada branch yang hanya berisi sebagian repo.

## Cara Mulai Kerja Frontend Developer

1. Sinkronkan branch integrasi frontend:
   - `git fetch origin`
   - `git switch fe`
   - `git pull --ff-only origin fe`
2. Buat branch kerja personal dari `fe`:
   - `git switch -c feature/fe-nama-fitur`
3. Kerjakan perubahan di folder `frontend/` (dan file terkait lintas folder bila diperlukan).
4. Commit, push branch personal, lalu buka PR ke `fe`.

## Cara Mulai Kerja Backend Developer

1. Sinkronkan branch integrasi backend:
   - `git fetch origin`
   - `git switch be`
   - `git pull --ff-only origin be`
2. Buat branch kerja personal dari `be`:
   - `git switch -c feature/be-nama-fitur`
3. Kerjakan perubahan di folder `backend-gas/` (dan file terkait lintas folder bila diperlukan).
4. Commit, push branch personal, lalu buka PR ke `be`.

## Alur PR ke `fe`/`be`/`test`/`main`

1. `feature/*` atau `fix/*` -> PR ke `fe` atau `be`.
2. `fe` dan/atau `be` -> PR ke `test`.
3. `test` -> PR ke `main` untuk rilis.

## Catatan Pengaturan GitHub

Branch protection dan aturan PR harus diatur manual di GitHub repository settings:

- Lindungi branch `main` dan `test`.
- Wajibkan pull request dan minimal 1 review.
- Nonaktifkan direct push ke `main`.
- Opsional: aktifkan auto-delete head branch setelah PR merge.
