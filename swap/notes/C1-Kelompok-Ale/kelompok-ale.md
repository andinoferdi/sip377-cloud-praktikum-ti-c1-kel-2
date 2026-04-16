# Kelompok Ale

## Ringkasan

Kelompok Ale kompatibel sebagian untuk swap backend dengan aplikasi lokal ini.

- `Link GAS` mereka terbuka publik dan merespons kontrak minimum penting untuk presensi, accelerometer sender, dan GPS.
- Modul 1, Modul 2 Preset A, dan Modul 3 bisa dibuktikan native lewat UI lokal.
- Bottleneck utama ada di endpoint visualizer tambahan, terutama `telemetry/accel/history`, serta endpoint sesi aktif dan konfigurasi course yang tidak mengikuti shape repo ini.
- Kesimpulan akhir: `layak swap parsial`.

## Identitas Partner

- Kelompok: `Kelompok Ale`
- Link GAS: `https://script.google.com/macros/s/AKfycbyYn2DefdPzUDlCIoJllHU3bANyrMtJhFKcQtcA0u_SGDpBepes1W0m36wMSlBITYhT/exec`
- Link Deploy: `https://cc-kelompok-ale.vercel.app/`
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
  Halaman dosen lokal berhasil generate QR ke partner. Ada warning fallback total pertemuan, tetapi QR tetap terbuat dan bisa dipakai.
- Modul 2: `parsial`
  Receiver lokal tidak bisa native penuh karena `telemetry/accel/history` partner `Route not found`, sehingga histori chart tidak bisa dibangun oleh receiver repo ini.
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
  - `presence/sessions/active` -> `Route not found`
  - `presence/course/config` -> UI lokal jatuh ke fallback total pertemuan default `14`
- Modul 2:
  - `telemetry/accel/history` -> `Route not found`

## Dampak ke UI Lokal

- Halaman yang bisa dipakai native:
  - mahasiswa scan untuk Modul 1 Preset A
  - dosen buat QR untuk Modul 1 Preset B
  - sender accelerometer untuk Modul 2 Preset A
  - sender GPS untuk Modul 3 Preset A
  - GPS map untuk Modul 3 Preset B
- Halaman yang tidak bisa dipakai native penuh:
  - receiver accelerometer untuk Modul 2 Preset B
  - sebagian flow monitor dosen yang membutuhkan sesi aktif atau config course penuh
- Untuk kasus parsial, bukti diambil dari halaman lokal yang tetap menampilkan `Swap Control`, endpoint aktif, dan overlay proof hasil fetch live ke partner.

## File Screenshot

- `kelompok-ale-modul-1-preset-a.png`
- `kelompok-ale-modul-1-preset-b.png`
- `kelompok-ale-modul-2-preset-a.png`
- `kelompok-ale-modul-2-preset-b.png`
- `kelompok-ale-modul-3-preset-a.png`
- `kelompok-ale-modul-3-preset-b.png`
