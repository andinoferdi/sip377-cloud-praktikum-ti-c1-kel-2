# C4 Kelompok 6

## Ringkasan

C4 Kelompok 6 `tidak kompatibel` untuk swap backend dengan aplikasi lokal ini.

- Endpoint inti presensi dan accelerometer langsung mengembalikan `not_found`.
- Backend tidak menunjukkan kontrak minimum yang dibutuhkan untuk swap test asli.
- Karena sender dan visualizer repo lokal tidak punya target API yang valid, swap test browser tidak dilanjutkan.

## Identitas Partner

- Kelompok: `6. kelompok 6`
- Link GAS: `https://script.google.com/macros/s/AKfycbyrl2aj2RkHh4QwMbcF5bGW8wShLA2wLKmLZ4NB5Y6-Gf54vp4dNGO2B4m9eR-uxTRMhQ/exec`
- Link Deploy: `https://cc-project-eight.vercel.app/`
- Kesimpulan akhir: `tidak kompatibel`

## Hasil Probe Awal

- `presence/status` -> `not_found`
- `telemetry/accel/latest` -> `not_found`
- `telemetry/gps/latest` -> tidak memberi respons API yang usable

## Dampak ke UI Lokal

- Modul 1, Modul 2, dan Modul 3 tidak layak diuji di browser karena kontrak backend inti tidak tersedia

## File Screenshot

- Tidak ada screenshot swap test
  Screening dihentikan di tahap probe karena endpoint minimum tidak tersedia.
