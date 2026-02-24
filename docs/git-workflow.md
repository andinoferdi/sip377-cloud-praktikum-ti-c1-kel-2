# Git Workflow Tim

## 1) Tujuan Tiap Branch

- `main`: branch stabil/rilis. Hanya menerima perubahan yang sudah lolos pengujian.
- `fe`: branch integrasi frontend.
- `be`: branch integrasi backend.
- `test`: branch integrasi QA/testing sebelum masuk `main`.

## 2) Aturan Branch Kerja Personal

Contoh penamaan branch:

- `feature/fe-qr-presence-page`
- `feature/be-presence-endpoints`
- `fix/fe-camera-permission`
- `fix/be-token-validation`

Aturan:

- Branch personal dibuat dari branch integrasi yang sesuai:
  - frontend dari `fe`
  - backend dari `be`
- Branch personal digunakan untuk pekerjaan harian, bukan `fe`/`be` langsung.

## 3) Alur Merge yang Benar

1. `feature/*` atau `fix/*` -> `fe` atau `be`
2. `fe`/`be` -> `test`
3. `test` -> `main`

## 4) Larangan

- Dilarang commit langsung ke `main`.
- Dilarang hotfix langsung di `test` tanpa membawa perbaikan kembali ke `fe`/`be`.
- Dilarang membuat branch yang hanya berisi sebagian repo.

## 5) Contoh Perintah Git Harian

```bash
# Ambil update remote
git fetch origin

# Pindah ke branch integrasi dan update
git switch fe
git pull --ff-only origin fe

# Buat branch kerja personal
git switch -c feature/fe-qr-presence-page

# Cek perubahan
git status
git add .
git commit -m "feat(fe): add qr presence page"

# Push branch kerja personal
git push -u origin feature/fe-qr-presence-page
```

## 6) Checklist Sebelum Buka PR

- Branch target sudah benar (`fe` atau `be`).
- Tidak ada file sensitif (token, secret, `.env`) ikut ter-commit.
- Scope PR jelas dan kecil (1 tujuan utama per PR).
- Commit message jelas.
- Perubahan sudah diuji lokal sesuai kebutuhan.
- Dokumentasi terkait sudah diperbarui (jika perlu).

## 7) Checklist Sebelum Merge ke `test`

- PR dari `fe`/`be` sudah direview minimal 1 orang.
- Konflik merge sudah diselesaikan.
- Fitur utama lintas FE-BE sudah diuji.
- Koleksi/postman test dasar (jika ada endpoint baru) sudah diperbarui.
- Tidak ada blocker kritis terbuka.

## 8) Checklist Sebelum Merge ke `main`

- Semua pengujian pada `test` lulus.
- Tidak ada bug kritis/high severity.
- Catatan rilis/perubahan penting sudah terdokumentasi.
- Sudah ada approval reviewer sesuai aturan repository.
- Merge dilakukan melalui PR (bukan direct push).
