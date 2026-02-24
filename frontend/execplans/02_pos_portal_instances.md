# 02 POS Portal dan POS Instance

## Tujuan

Bangun halaman portal POS dan CRUD POS Instance sebagai modul multi-outlet POS murni. Tidak ada referensi ke properti, PMS, atau MyListTrip. Satu Workspace punya banyak POS Instance. Setiap POS Instance adalah satu outlet atau counter kasir.

## Keputusan desain yang sudah dikunci

1. Akses berbasis role dan Workspace, bukan penugasan per outlet. Semua user dalam satu Workspace bisa mengakses semua POS Instance sesuai role mereka.
2. Non-admin yang memilih card POS Instance langsung diarahkan ke halaman operasional default outlet tersebut. FnB diarahkan ke sales create. Role lain diarahkan ke sales list atau halaman operasional default sesuai permission.
3. Tab Service tidak punya batas jumlah tab terbuka bersamaan.
4. Inventory dan categories bersifat global dalam satu Workspace. Semua POS Instance memakai katalog yang sama. Field `pos_instance_id` disimpan pada stock movement dan sales item untuk audit dan laporan per outlet.
5. Label meja unik dalam satu POS Instance. Admin boleh menambah, mengurangi, dan mengubah label meja setelah POS Instance dibuat.
6. Saat membuat POS Instance, type tidak bisa diubah setelah disimpan. Admin hanya bisa mengubah name dan jumlah meja (Table Service).

---

## Alur UI

### Portal Page (`/dashboard/portal`)

User yang sudah login melihat halaman portal berisi daftar POS Instance dalam bentuk card grid.

Setiap card menampilkan:

- Name POS Instance.
- Type badge: "Table Service" atau "Tab Service".
- Jumlah meja (khusus Table Service).
- Status badge: active atau inactive.

Perilaku klik card:

- Admin: masuk ke halaman detail/edit POS Instance.
- FnB: langsung redirect ke `/dashboard/pos/sales/create?posInstanceId={id}`.
- FnB Manager dan Host: redirect ke `/dashboard/pos/sales?posInstanceId={id}`.

Admin melihat tombol "Tambah POS Instance" di atas card grid.

### Form Create POS Instance (admin only)

Dialog modal atau halaman terpisah.

Field:

- `name` (text, wajib, 1-100 karakter).
- `type` (select, wajib, pilihan: TABLE_SERVICE atau TAB_SERVICE).
- `totalTable` (number, wajib jika type TABLE_SERVICE, min 1, max 200).

Validasi:

- Name tidak boleh duplikat dalam satu Workspace (case-insensitive).
- Jika type TABLE_SERVICE, totalTable wajib diisi dan minimal 1.
- Jika type TAB_SERVICE, totalTable disembunyikan dan tidak dikirim.

Saat disimpan dengan type TABLE_SERVICE, sistem otomatis membuat record `TableLabel` sebanyak `totalTable`, dengan label default "1", "2", ..., "N".

### Form Edit POS Instance (admin only)

Field:

- `name` (editable).
- `type` (read-only, ditampilkan sebagai teks).
- `totalTable` (editable jika type TABLE_SERVICE, bisa dinaikkan atau diturunkan).

Validasi:

- Name tidak boleh duplikat (kecuali nama milik instance ini sendiri).
- Jika totalTable dinaikkan, sistem menambah record TableLabel baru dengan label default lanjutan.
- Jika totalTable diturunkan, sistem menghapus record TableLabel dari belakang (urutan `position` tertinggi). Endpoint harus mengembalikan error jika meja yang akan dihapus sedang dipakai transaksi aktif.

### Halaman Table Labels (admin only, khusus Table Service)

Tampil saat admin masuk ke detail POS Instance bertipe Table Service.

Daftar meja ditampilkan sebagai tabel atau grid card. Setiap item menampilkan position (urutan), label saat ini, dan tombol edit inline.

Admin bisa mengubah label meja satu per satu. Validasi:

- Label tidak boleh kosong.
- Label unik dalam satu POS Instance (case-insensitive).
- Panjang label maksimal 10 karakter.

### Delete POS Instance (admin only)

Soft delete dengan set `isActive = false`. Card tetap tampil dengan badge "Inactive" dan tidak bisa dipilih non-admin. Admin bisa mengaktifkan kembali.

---

## Data Model

### POSInstance

```prisma
enum POSInstanceType {
  TABLE_SERVICE
  TAB_SERVICE

  @@map("pos_instance_type")
}

model POSInstance {
  id          String          @id @default(uuid()) @db.Uuid
  name        String
  type        POSInstanceType
  totalTable  Int             @default(0) @map("total_table")
  isActive    Boolean         @default(true) @map("is_active")
  createdAt   DateTime        @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime        @updatedAt @map("updated_at") @db.Timestamptz(6)
  tableLabels TableLabel[]

  @@unique([name])
  @@map("pos_instances")
}
```

Catatan:

- Unique constraint pada `name` mencegah duplikat dalam Workspace. Karena saat ini satu database per Workspace, unique di level tabel sudah cukup.
- `totalTable` redundan terhadap jumlah record `TableLabel`, tetapi dijaga untuk validasi cepat dan tampilan card tanpa join.

### TableLabel

```prisma
model TableLabel {
  id            String      @id @default(uuid()) @db.Uuid
  posInstanceId String      @map("pos_instance_id") @db.Uuid
  position      Int
  label         String      @db.VarChar(10)
  createdAt     DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime    @updatedAt @map("updated_at") @db.Timestamptz(6)
  posInstance   POSInstance @relation(fields: [posInstanceId], references: [id], onDelete: Cascade)

  @@unique([posInstanceId, position])
  @@unique([posInstanceId, label])
  @@map("table_labels")
}
```

Catatan:

- `position` menentukan urutan meja (1-based).
- `label` adalah teks custom yang ditampilkan di struk dan kitchen ticket.
- Unique constraint `[posInstanceId, label]` menjamin label unik per POS Instance.
- Unique constraint `[posInstanceId, position]` menjamin position tidak duplikat.

---

## Endpoint API

### POS Instance CRUD

| Method | Path                                     | Permission            | Deskripsi                                                                              |
| ------ | ---------------------------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/api/portal/pos-instances`              | `pos_instance:read`   | List semua POS Instance (active dan inactive untuk admin, active only untuk non-admin) |
| POST   | `/api/portal/pos-instances`              | `pos_instance:create` | Buat POS Instance baru. Admin only.                                                    |
| GET    | `/api/portal/pos-instances/[id]`         | `pos_instance:read`   | Detail satu POS Instance beserta table labels                                          |
| PUT    | `/api/portal/pos-instances/[id]`         | `pos_instance:update` | Edit name dan totalTable. Admin only.                                                  |
| DELETE | `/api/portal/pos-instances/[id]`         | `pos_instance:delete` | Soft delete (set isActive false). Admin only.                                          |
| PATCH  | `/api/portal/pos-instances/[id]/restore` | `pos_instance:update` | Restore (set isActive true). Admin only.                                               |

### Table Labels

| Method | Path                                              | Permission            | Deskripsi                                       |
| ------ | ------------------------------------------------- | --------------------- | ----------------------------------------------- |
| GET    | `/api/portal/pos-instances/[id]/tables`           | `pos_instance:read`   | List semua table labels untuk satu POS Instance |
| PUT    | `/api/portal/pos-instances/[id]/tables/[tableId]` | `pos_instance:update` | Edit label satu meja. Admin only.               |

### Rule validasi API

**POST `/api/portal/pos-instances`**

- Body: `{ name: string, type: "TABLE_SERVICE" | "TAB_SERVICE", totalTable?: number }`.
- `name` wajib, 1-100 karakter, unique case-insensitive.
- `type` wajib, harus salah satu enum.
- Jika type TABLE_SERVICE, `totalTable` wajib, integer 1-200.
- Jika type TAB_SERVICE, `totalTable` diabaikan, disimpan 0.
- Response 201: POS Instance yang baru dibuat.

**PUT `/api/portal/pos-instances/[id]`**

- Body: `{ name?: string, totalTable?: number }`.
- `type` tidak boleh ada di body (immutable).
- `name` jika diisi, 1-100 karakter, unique case-insensitive (exclude self).
- `totalTable` hanya boleh diubah jika type TABLE_SERVICE.
- Jika totalTable dinaikkan, buat TableLabel baru dengan position dan label default lanjutan.
- Jika totalTable diturunkan, hapus TableLabel dari position tertinggi. Return 409 jika meja yang akan dihapus terikat transaksi aktif.
- Response 200: POS Instance yang diperbarui.

**DELETE `/api/portal/pos-instances/[id]`**

- Soft delete. Set `isActive = false`.
- Response 200: `{ message: "POS Instance deactivated" }`.

**PUT `/api/portal/pos-instances/[id]/tables/[tableId]`**

- Body: `{ label: string }`.
- `label` wajib, 1-10 karakter, unique case-insensitive dalam POS Instance (exclude self).
- Response 200: TableLabel yang diperbarui.

---

## Permission Check

### Modul permission baru

Tambahkan `pos_instance` ke `PERMISSION_MODULES` di `src/types/rbac.ts`.

Permission keys baru:

- `pos_instance:create` (admin only)
- `pos_instance:read` (semua role)
- `pos_instance:update` (admin only)
- `pos_instance:delete` (admin only)

### Update seed

Tambahkan permission catalog entries untuk modul `pos_instance` di `prisma/seed.mjs`.

Role mapping:

- `admin`: semua aksi (`create`, `read`, `update`, `delete`).
- `fnb`: hanya `read`.
- `fnb_manager`: hanya `read`.
- `host`: hanya `read`.

### Update proxy.ts

Tambahkan rule baru di `DASHBOARD_RULES`:

- `{ prefix: "/dashboard/portal", permission: "pos_instance:read" }`.

Tambahkan rule baru di `resolveApiPermission`:

- `GET /api/portal/pos-instances` -> `pos_instance:read`.
- `POST /api/portal/pos-instances` -> `pos_instance:create`.
- `GET /api/portal/pos-instances/:id` -> `pos_instance:read`.
- `PUT /api/portal/pos-instances/:id` -> `pos_instance:update`.
- `DELETE /api/portal/pos-instances/:id` -> `pos_instance:delete`.
- `PATCH /api/portal/pos-instances/:id/restore` -> `pos_instance:update`.
- `GET /api/portal/pos-instances/:id/tables` -> `pos_instance:read`.
- `PUT /api/portal/pos-instances/:id/tables/:tableId` -> `pos_instance:update`.

### Update sidebar

Ubah portal section di `app-sidebar.tsx`. Tambahkan item pertama "POS Outlets" yang mengarah ke `/dashboard/portal` dengan permission `pos_instance:read`. Item inventory, categories, dan reports tetap di bawahnya.

---

## Redirect logic per role

Saat non-admin klik card POS Instance di portal:

1. Baca `roleCode` dari session.
2. Tentukan target URL berdasarkan role:
   - `fnb`: `/dashboard/pos/sales/create?posInstanceId={id}`.
   - `fnb_manager`: `/dashboard/pos/sales?posInstanceId={id}`.
   - `host`: `/dashboard/pos/sales?posInstanceId={id}`.
3. Redirect client-side via `router.push()`.

Admin yang klik card masuk ke halaman detail: `/dashboard/portal/pos-instances/[id]`.

---

## Routing pages baru

| Path                                          | File                                                                      | Keterangan                                               |
| --------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| `/dashboard/portal`                           | `src/app/(dashboard)/dashboard/portal/page.tsx`                           | Portal page dengan card grid POS Instance                |
| `/dashboard/portal/pos-instances/create`      | `src/app/(dashboard)/dashboard/portal/pos-instances/create/page.tsx`      | Form create (admin only)                                 |
| `/dashboard/portal/pos-instances/[id]`        | `src/app/(dashboard)/dashboard/portal/pos-instances/[id]/page.tsx`        | Detail dan edit POS Instance (admin only)                |
| `/dashboard/portal/pos-instances/[id]/tables` | `src/app/(dashboard)/dashboard/portal/pos-instances/[id]/tables/page.tsx` | Table labels management (admin only, Table Service only) |

---

## File baru yang dibutuhkan

### Prisma

- Update `prisma/schema.prisma`: tambah enum `POSInstanceType`, model `POSInstance`, model `TableLabel`.
- Update `prisma/seed.mjs`: tambah permission catalog `pos_instance` dan role mapping.

### Feature module

- `src/features/portal/components/pos-instance-card.tsx`
- `src/features/portal/components/pos-instance-form.tsx`
- `src/features/portal/components/table-label-editor.tsx`
- `src/features/portal/hooks/use-pos-instances.ts`
- `src/features/portal/hooks/use-pos-instance-detail.ts`
- `src/features/portal/services/pos-instance-service.ts`
- `src/features/portal/schemas/pos-instance.schema.ts`
- `src/features/portal/types.ts`

### API routes

- `src/app/api/portal/pos-instances/route.ts` (GET, POST)
- `src/app/api/portal/pos-instances/[id]/route.ts` (GET, PUT, DELETE)
- `src/app/api/portal/pos-instances/[id]/restore/route.ts` (PATCH)
- `src/app/api/portal/pos-instances/[id]/tables/route.ts` (GET)
- `src/app/api/portal/pos-instances/[id]/tables/[tableId]/route.ts` (PUT)

### Pages

- `src/app/(dashboard)/dashboard/portal/page.tsx`
- `src/app/(dashboard)/dashboard/portal/pos-instances/create/page.tsx`
- `src/app/(dashboard)/dashboard/portal/pos-instances/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/portal/pos-instances/[id]/tables/page.tsx`

---

## Test plan

### Unit test

1. Zod schema `posInstanceSchema`:
   - Name kosong ditolak.
   - Name lebih dari 100 karakter ditolak.
   - Type selain TABLE_SERVICE dan TAB_SERVICE ditolak.
   - TABLE_SERVICE tanpa totalTable ditolak.
   - TABLE_SERVICE dengan totalTable 0 ditolak.
   - TAB_SERVICE dengan totalTable diabaikan.

2. Zod schema `tableLabelSchema`:
   - Label kosong ditolak.
   - Label lebih dari 10 karakter ditolak.

3. Redirect logic helper:
   - Role fnb menghasilkan URL sales create.
   - Role fnb_manager menghasilkan URL sales list.
   - Role host menghasilkan URL sales list.
   - Role admin menghasilkan URL detail instance.

### API integration test

1. POST `/api/portal/pos-instances`:
   - Anonymous -> 401.
   - FnB -> 403.
   - Admin dengan body valid TABLE_SERVICE -> 201, cek totalTable record TableLabel tercipta.
   - Admin dengan body valid TAB_SERVICE -> 201, cek totalTable 0 dan tidak ada TableLabel.
   - Admin dengan name duplikat -> 409.

2. PUT `/api/portal/pos-instances/[id]`:
   - Admin ubah name -> 200.
   - Admin ubah type di body -> 400.
   - Admin naikkan totalTable -> 200, cek TableLabel bertambah.
   - Admin turunkan totalTable -> 200, cek TableLabel berkurang.
   - Admin turunkan totalTable saat meja terikat transaksi -> 409.

3. DELETE `/api/portal/pos-instances/[id]`:
   - Admin -> 200, cek isActive false.
   - FnB -> 403.

4. PUT `/api/portal/pos-instances/[id]/tables/[tableId]`:
   - Admin ubah label valid -> 200.
   - Admin ubah label duplikat -> 409.
   - Admin ubah label kosong -> 400.

### E2E test (manual atau Playwright)

1. Login admin, buka portal, lihat card grid.
2. Create POS Instance Table Service dengan 5 meja.
3. Verifikasi 5 meja dengan label default "1" sampai "5".
4. Edit label meja ke "5c", verifikasi card menampilkan update.
5. Edit POS Instance, naikkan meja ke 7, verifikasi 2 meja baru.
6. Login FnB, buka portal, klik card, verifikasi redirect ke sales create.
7. Login FnB, coba akses create POS Instance, verifikasi 403 atau redirect forbidden.
