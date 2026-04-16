# Kelompok 7

## Ringkasan

Kelompok 7 tidak kompatibel untuk swap backend publik dengan aplikasi lokal ini.

- `Link GAS` selalu redirect ke `accounts.google.com` untuk endpoint yang diprobe.
- Dampaknya, baik flow `sender -> partner` maupun `visualizer -> partner` tidak bisa dijalankan secara nyata dari `http://localhost:3000`.
- `Link Deploy` mereka terbuka dan bisa diakses, tetapi implementasinya adalah aplikasi presensi terpisah berbasis `action=register_beacon`, bukan kontrak API modul 1-3 yang dipakai repo ini.

## Identitas Partner

- Kelompok: `Kelompok 7`
- Link GAS: `https://script.google.com/macros/s/AKfycbzwEOB4ji8PBSv7tIX4xz1Dhbn6xK93P-fY2Hw6QusCcN3QgA51HOuRx9umvuXQFl42/exec`
- Link Deploy: `https://sutantiyarp.github.io/tugas/`
- Kesimpulan akhir: `tidak kompatibel`

## Status Swap Test

### Preset A

- Modul 1: `gagal`
  Sender diarahkan ke partner, tetapi endpoint presensi partner redirect ke Google Sign-In.
- Modul 2: `gagal`
  Sender accelerometer tidak bisa flush ke partner karena request berhenti di auth Google.
- Modul 3: `gagal`
  Sender GPS tidak bisa log titik ke partner karena request berhenti di auth Google.

### Preset B

- Modul 1: `gagal`
  Visualizer diarahkan ke partner, tetapi pembacaan status presensi ke backend partner terblokir auth.
- Modul 2: `gagal`
  Receiver tidak bisa membaca data partner karena endpoint visualizer partner tidak bisa diakses publik.
- Modul 3: `gagal`
  Map tidak bisa membaca latest atau history GPS dari partner; halaman lokal menampilkan `Failed to fetch`.

## Endpoint Partner yang Terbukti

- Probe ke endpoint modul 1, 2, dan 3 pada `Link GAS` berujung:
  `302 -> accounts.google.com`
- Artinya backend GAS partner tidak terbuka untuk akses publik yang dibutuhkan swap test.

## Endpoint Partner yang Gagal atau Redirect

- Modul 1:
  - `presence/status` redirect ke Google Sign-In
  - endpoint presensi lain diasumsikan tidak bisa dipakai publik karena basis URL GAS sudah terproteksi auth
- Modul 2:
  - `telemetry/accel/*` tidak bisa dipakai publik karena redirect auth
- Modul 3:
  - `telemetry/gps/*` tidak bisa dipakai publik karena redirect auth

## Dampak ke UI Lokal

- Bukti native via UI tidak bisa dilakukan untuk semua modul karena partner GAS tertutup auth.
- Bukti yang berhasil dikumpulkan berupa:
  - panel `Swap Control`
  - endpoint aktif sender atau visualizer
  - overlay proof yang menjelaskan blocker auth
  - pada Modul 3 Preset B, UI lokal juga menampilkan `Failed to fetch`
- Tidak ada modul yang bisa dikategorikan `berhasil native lewat UI`.
- Tidak ada modul yang layak dikategorikan `parsial` karena backend partner tidak pernah benar-benar melayani kontrak API repo ini secara publik.

## Catatan Deploy Fallback

- `Link Deploy` Kelompok 7 bisa diakses publik.
- Dari inspeksi halaman awal, aplikasi mereka memakai flow registrasi sendiri dengan parameter `action=register_beacon`.
- Flow ini tidak cocok dengan kontrak repo ini untuk:
  - Modul 1: `presence/checkin`, `presence/status`, `presence/list`, `presence/sessions/active`
  - Modul 2: `telemetry/accel`, `telemetry/accel/latest`, `telemetry/accel/history`
  - Modul 3: `telemetry/gps`, `telemetry/gps/latest`, `telemetry/gps/history`
- Jadi deploy mereka tidak dapat dipakai sebagai pengganti backend swap yang kompatibel.

## File Screenshot

- `kelompok-7-modul-1-preset-a.png`
- `kelompok-7-modul-2-preset-a.png`
- `kelompok-7-modul-3-preset-a.png`
- `kelompok-7-modul-1-preset-b.png`
- `kelompok-7-modul-2-preset-b.png`
- `kelompok-7-modul-3-preset-b.png`
