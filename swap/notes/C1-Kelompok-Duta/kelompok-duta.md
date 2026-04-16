# Kelompok Duta

## Ringkasan

Kelompok Duta kompatibel sebagian untuk swap backend dengan aplikasi lokal ini.

- `Link GAS` mereka terbuka publik dan benar-benar merespons kontrak API untuk banyak flow penting.
- Modul 1 dan Modul 3 bisa dibuktikan native lewat UI lokal pada skenario yang relevan.
- Bottleneck utama ada di Modul 2 visualizer karena `telemetry/accel/history` tidak mengembalikan shape yang dibutuhkan receiver repo ini.
- Karena masih ada mismatch pada endpoint visualizer tertentu, hasil akhirnya adalah `layak swap parsial`.

## Identitas Partner

- Kelompok: `kelompok duta`
- Link GAS: `https://script.google.com/macros/s/AKfycbxa2DD20hVIMol4-LRpOxdR5fN_kRjh4Itm-sADeDV8VDLRb8SgZHWcypS5luyzwOeS/exec`
- Link Deploy: `https://presensi-qr-kelompok4.vercel.app/`
- Kesimpulan akhir: `layak swap parsial`

## Status Swap Test

### Preset A

- Modul 1: `berhasil native lewat UI`
  Halaman mahasiswa lokal berhasil check-in ke backend partner memakai token partner.
- Modul 2: `berhasil native lewat UI`
  Sender accelerometer lokal berhasil flush sample ke partner, dan `telemetry/accel/latest` partner menampilkan sample terbaru.
- Modul 3: `berhasil native lewat UI`
  Sender GPS lokal berhasil mengirim titik ke partner, dan probe partner menunjukkan `latest` serta `history` terisi.

### Preset B

- Modul 1: `berhasil native lewat UI`
  Halaman dosen lokal berhasil generate QR ke partner pada mode `visualizer -> partner`.
- Modul 2: `parsial`
  Receiver lokal tidak bisa menampilkan histori native karena `telemetry/accel/history` partner tidak mengembalikan array `items`; bukti yang valid hanya `latest` hidup dan receiver tetap kosong.
- Modul 3: `berhasil native lewat UI`
  Halaman map lokal berhasil membaca `latest` dan `history` GPS dari partner.

## Endpoint Partner yang Terbukti Hidup

- Modul 1:
  - `presence/qr/generate`
  - `presence/checkin`
  - `presence/status`
  - `presence/list`
- Modul 2:
  - `telemetry/accel`
  - `telemetry/accel/latest`
- Modul 3:
  - `telemetry/gps`
  - `telemetry/gps/latest`
  - `telemetry/gps/history`

## Endpoint Partner yang Tidak Sepenuhnya Kompatibel

- Modul 1:
  - `presence/sessions/active` -> mengembalikan data generik `{"status":"Server Aktif"}`, bukan daftar sesi aktif yang dibutuhkan monitor lokal
  - `presence/course/config` -> mengembalikan data generik `{"status":"Server Aktif"}`, bukan shape config course lokal
- Modul 2:
  - `telemetry/accel/history` -> mengembalikan data generik `{"status":"Server Aktif"}`, bukan histori `items[]` yang dibutuhkan receiver lokal

## Dampak ke UI Lokal

- Halaman yang bisa dipakai native:
  - mahasiswa scan untuk Modul 1 Preset A
  - dosen buat QR untuk Modul 1 Preset B
  - sender accelerometer untuk Modul 2 Preset A
  - sender GPS untuk Modul 3 Preset A
  - GPS map untuk Modul 3 Preset B
- Halaman yang tidak bisa dipakai native penuh:
  - receiver accelerometer untuk Modul 2 Preset B
  - sebagian flow monitor atau config dosen untuk Modul 1, karena endpoint `active` dan `course/config` tidak sesuai kontrak repo ini
- Untuk kasus parsial, bukti diambil dari halaman lokal yang tetap menampilkan `Swap Control`, endpoint aktif, dan overlay proof hasil fetch live ke partner.

## Catatan Deploy Fallback

- `Link Deploy` Kelompok Duta bisa diakses publik.
- Homepage deploy mereka juga menampilkan modul `/presensi`, `/accelerometer`, `/gps`, dan `/swap-test`.
- Namun penilaian swap di notes ini tetap didasarkan pada kompatibilitas backend GAS terhadap kontrak repo lokal, bukan hanya dari deploy publik mereka.

## File Screenshot

- `kelompok-duta-modul-1-preset-a.png`
- `kelompok-duta-modul-1-preset-b.png`
- `kelompok-duta-modul-2-preset-a.png`
- `kelompok-duta-modul-2-preset-b.png`
- `kelompok-duta-modul-3-preset-a.png`
- `kelompok-duta-modul-3-preset-b.png`
