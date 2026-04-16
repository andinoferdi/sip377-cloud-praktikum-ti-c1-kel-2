# Kelompok 1

## Ringkasan

Kelompok 1 hanya kompatibel sebagian untuk swap backend dengan aplikasi lokal ini.

- Beberapa endpoint partner benar-benar hidup dan bisa dipakai untuk demo nyata.
- Namun kontrak partner tidak lengkap untuk semua halaman visualizer yang dipakai repo ini.
- Karena itu hasil akhirnya adalah `layak swap parsial`, bukan `layak swap penuh`.

## Identitas Partner

- Kelompok: `Kelompok 1`
- Link GAS: `https://script.google.com/macros/s/AKfycbzXQyqvnr1igO1MDW3E1_9t4w_HMb0BSJ54I-ukFHo1QNo8XCl63NncIQ3OLrD7aLdA/exec`
- Link Deploy: `-`
- Kesimpulan akhir: `layak swap parsial`

## Status Swap Test

### Preset A

- Modul 1: `berhasil native lewat UI`
  Check-in mahasiswa ke partner berhasil dan menghasilkan `presence_id`.
- Modul 2: `berhasil native lewat UI`
  Sender accelerometer berhasil mengirim telemetry ke partner.
- Modul 3: `berhasil native lewat UI`
  Sender GPS berhasil mengirim titik lokasi ke partner.

### Preset B

- Modul 1: `parsial`
  Monitor dosen tidak bisa dipakai native karena partner tidak menyediakan `presence/list` dan `presence/sessions/active`. Bukti yang bisa diambil adalah `presence/status` live dari partner.
- Modul 2: `parsial`
  Receiver repo ini butuh `telemetry/accel/history`, sedangkan partner hanya terbukti melayani `telemetry/accel/latest`. Bukti yang bisa diambil adalah hasil live dari endpoint partner di overlay proof.
- Modul 3: `berhasil native lewat UI`
  Map berhasil membaca `latest` dan `history` GPS dari partner.

## Endpoint Partner yang Terbukti Hidup

- Modul 1:
  - `presence/checkin`
  - `presence/status`
- Modul 2:
  - `telemetry/accel`
  - `telemetry/accel/latest`
- Modul 3:
  - `telemetry/gps`
  - `telemetry/gps/latest`
  - `telemetry/gps/history`

## Endpoint Partner yang Gagal atau Tidak Lengkap

- Modul 1:
  - `presence/list` -> `endpoint_not_found`
  - `presence/sessions/active` -> `endpoint_not_found`
  - `presence/course/config` -> `endpoint_not_found`
- Modul 2:
  - `telemetry/accel/history` -> `endpoint_not_found`

## Dampak ke UI Lokal

- Halaman yang bisa dipakai native:
  - scan mahasiswa untuk Modul 1 Preset A
  - sender accelerometer untuk Modul 2 Preset A
  - sender GPS untuk Modul 3 Preset A
  - GPS map untuk Modul 3 Preset B
- Halaman yang tidak bisa dipakai native penuh:
  - monitor dosen untuk Modul 1 Preset B
  - accelerometer receiver untuk Modul 2 Preset B
- Untuk dua kasus parsial itu, bukti diambil lewat overlay proof live pada halaman lokal sambil panel `Swap Control` tetap menunjukkan arah endpoint aktif.

## File Screenshot

- `kelompok-1-modul-1-preset-a.png`
- `kelompok-1-modul-2-preset-a.png`
- `kelompok-1-modul-3-preset-a.png`
- `kelompok-1-modul-1-preset-b.png`
- `kelompok-1-modul-2-preset-b.png`
- `kelompok-1-modul-3-preset-b.png`
