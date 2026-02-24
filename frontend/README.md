# Next.js Prisma Auth Starter - Setup Guide

Panduan langkah demi langkah untuk menjalankan project ini dari nol.

## Prasyarat

- [Node.js](https://nodejs.org/) versi 20 atau lebih baru
- [Git](https://git-scm.com/)
- Akun [Supabase](https://supabase.com/) untuk database
- Akun [GitHub](https://github.com/) opsional untuk login provider

---

## 1. Clone Project

```bash
git clone https://github.com/andinoferdi/SIPOS.git
cd SIPOS
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Konfigurasi Environment Variables

Gunakan hanya file `.env`.

Isi `.env` dengan format berikut dulu:

```env
AUTH_SECRET="ganti_dengan_string_acak_panjang"
AUTH_URL="http://localhost:3000"

# Runtime app untuk serverless (transaction pooler)
DATABASE_URL=""

# Direct/session connection untuk CLI dan seed
DIRECT_URL=""

OPENAI_API_KEY=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

Catatan penting:

1. Password wajib URL-encoded jika ada karakter khusus seperti `#`, `@`, `!`.
2. Standar tim deploy serverless: `DATABASE_URL` = port `6543`, `DIRECT_URL` = port `5432`.

---

## 4. Setup Supabase

1. Buka [database.new](https://database.new), lalu buat project baru.
2. Simpan password database Anda karena akan dipakai di connection string.
3. Di dashboard project, klik tombol `Connect` di header.
4. Pilih tab `ORMs`, lalu pilih tool `Prisma`.
5. Salin `DATABASE_URL` dan `DIRECT_URL`.
6. Tempel nilainya ke file `.env`:
   1. `DATABASE_URL` pakai transaction pooler `6543` dan `pgbouncer=true`.
   2. `DIRECT_URL` pakai session/direct `5432`.

Jika lupa password database:

1. Buka menu `Database` di sidebar kiri.
2. Masuk ke `Settings`.
3. Klik `Reset database password`.
4. Update password baru di `DATABASE_URL` dan `DIRECT_URL`.

Untuk key Supabase client:

1. Buka `Project Settings`.
2. Pilih `API Keys`.
3. Di tab `Publishable and secret API keys`, ambil URL project dan publishable key.
4. Jika tetap butuh anon key legacy, ambil dari tab `Legacy anon, service_role API keys`.

Referensi:

1. https://supastarter.dev/docs/nextjs/recipes/supabase-setup
2. https://supabase.com/docs/guides/troubleshooting/how-do-i-reset-my-supabase-database-password-oTs5sB
3. https://supabase.com/docs/guides/database/prisma
4. https://supabase.com/docs/reference/postgres/connection-strings

---

## 5. Setup Database

Jalankan sinkronisasi schema:

```bash
npx prisma db push
```

Lanjut seed data awal:

```bash
npm run db:seed
```

Aturan koneksi command:

1. `npx prisma db push` dan operasi schema Prisma berjalan lewat jalur direct/session.
2. `npm run db:seed` memakai `DIRECT_URL` lebih dulu, lalu fallback ke `DATABASE_URL` jika `DIRECT_URL` kosong.
3. Runtime app di Vercel/serverless tetap memakai `DATABASE_URL` port `6543`.

Catatan:

1. `db push` bisa menampilkan target `:5432`. Itu normal karena memakai jalur direct/session.
2. `db:seed` memakai script SQL berbasis driver `pg` agar stabil lintas versi Node.

Default credentials hasil seed:

| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | `admin@sipos.local` | `admin123` |
| Manager | `manager@demo.sipos.local` | `demo123` |
| FnB | `fnb@demo.sipos.local` | `demo123` |
| Host | `host@demo.sipos.local` | `demo123` |

---

## 6. Menjalankan Aplikasi

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

Buka di `http://localhost:3000`.

---

## Troubleshooting Port Supabase

Jika local bermasalah saat `DATABASE_URL` memakai `6543`:

1. Cek dulu apakah password di URL sudah encoded.
2. Jalankan `npx prisma db push` untuk memastikan koneksi direct/session sehat.
3. Tes reachability pooler `6543`:

```powershell
Test-NetConnection aws-1-ap-southeast-2.pooler.supabase.com -Port 6543
```

4. Cek status pooler di Supabase Dashboard.

Fallback local-only:

1. Untuk unblock sementara, Anda boleh set `DATABASE_URL` ke `5432`.
2. Sebelum deploy, kembalikan lagi ke split resmi:
   1. `DATABASE_URL` = `6543` + `pgbouncer=true`
   2. `DIRECT_URL` = `5432`

---

## Tips Tambahan

- Jika Anda mengubah `prisma/schema.prisma`, jalankan `npx prisma db push` lagi.
- Untuk lihat data DB di browser, jalankan:

```bash
npx prisma studio
```
