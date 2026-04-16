# Kelompok Ameng

## Ringkasan

Kelompok Ameng kompatibel sebagian untuk swap backend dengan aplikasi lokal ini.

- `Link GAS` mereka terbuka publik dan bisa dipakai untuk flow inti presensi, accelerometer sender, dan GPS.
- Modul 1, Modul 2 Preset A, dan Modul 3 bisa dibuktikan native lewat UI lokal.
- Bottleneck utamanya ada pada endpoint visualizer tambahan yang mengembalikan respons generik `GAS Backend API is running.`, bukan shape data yang dibutuhkan UI lokal.
- Kesimpulan akhir: `layak swap parsial`.

## Identitas Partner

- Kelompok: `Kelompok Ameng`
- Link GAS: `https://script.google.com/macros/s/AKfycbyNepWGdF-dVMOBVnv_4JXS4Ik1e2MHP8Pp3e4zd45ARqpMujrxg3gmIQbjt7xbk7Yz3A/exec`
- Link Deploy: `https://cloud-computing-project-six.vercel.app/`
- Kesimpulan akhir: `layak swap parsial`

## Status Swap Test

### Preset A

- Modul 1: `berhasil native lewat UI`
  Halaman mahasiswa lokal berhasil check-in ke backend partner memakai token QR partner.
- Modul 2: `berhasil native lewat UI`
  Sender accelerometer lokal berhasil flush sample ke partner, dan `telemetry/accel/latest` partner memperlihatkan sample terbaru.
- Modul 3: `berhasil native lewat UI`
  Sender GPS lokal berhasil mengirim titik ke partner, dan `latest/history` GPS partner terisi dengan shape yang kompatibel.

### Preset B

- Modul 1: `berhasil native lewat UI`
  Halaman dosen lokal berhasil generate QR ke partner pada mode `visualizer -> partner`.
- Modul 2: `parsial`
  Receiver lokal tidak bisa native penuh karena `telemetry/accel/history` partner mengembalikan data generik status server, bukan array histori `items[]`.
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
  - `presence/sessions/active` -> mengembalikan data generik status server, bukan daftar sesi aktif
  - `presence/course/config` -> tidak tersedia sebagai config course yang dipakai repo ini
- Modul 2:
  - `telemetry/accel/history` -> mengembalikan data generik `{"status":"ok","message":"GAS Backend API is running."}`

## Dampak ke UI Lokal

- Halaman yang bisa dipakai native:
  - mahasiswa scan untuk Modul 1 Preset A
  - dosen buat QR untuk Modul 1 Preset B
  - sender accelerometer untuk Modul 2 Preset A
  - sender GPS untuk Modul 3 Preset A
  - GPS map untuk Modul 3 Preset B
- Halaman yang tidak bisa dipakai native penuh:
  - receiver accelerometer untuk Modul 2 Preset B
  - flow monitor dosen atau visualizer yang bergantung pada sesi aktif dan config course penuh
- Untuk kasus parsial, bukti diambil dari halaman lokal yang tetap menampilkan `Swap Control`, endpoint aktif, dan overlay proof hasil fetch live ke partner.

## File Screenshot

- `kelompok-ameng-modul-1-preset-a.png`
- `kelompok-ameng-modul-1-preset-b.png`
- `kelompok-ameng-modul-2-preset-a.png`
- `kelompok-ameng-modul-2-preset-b.png`
- `kelompok-ameng-modul-3-preset-a.png`
- `kelompok-ameng-modul-3-preset-b.png`
