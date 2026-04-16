# C4 Kelompok 1

## Ringkasan

C4 Kelompok 1 `tidak kompatibel` untuk swap backend dengan aplikasi lokal ini.

- Beberapa endpoint presensi dasar masih merespons JSON, tetapi endpoint inti lain tidak tersedia atau mengembalikan HTML non-API.
- `presence/qr/generate` gagal `not_found`, sehingga flow dosen Modul 1 tidak bisa dibuktikan.
- `telemetry/accel/latest` mengembalikan halaman HTML Google Drive, bukan respons telemetry JSON.
- Karena kontrak minimum lintas modul rusak, swap test browser tidak dilanjutkan.

## Identitas Partner

- Kelompok: `1 kelompok 1`
- Link GAS: `https://script.google.com/macros/s/AKfycbyIml8bW4C4HcoR3vRlCw-g2Mdl5DqKfKjvPe2TxYtEv8aM4MKmUg00fB61vXY8ynmw/exec`
- Link Deploy: `https://web-kel1-c4.vercel.app/`
- Kesimpulan akhir: `tidak kompatibel`

## Hasil Probe Awal

- `presence/status` -> hidup
- `presence/list` -> `endpoint_not_found`
- `presence/sessions/active` -> `endpoint_not_found`
- `presence/qr/generate` -> `not_found`
- `telemetry/accel/latest` -> HTML non-API
- `telemetry/accel/history` -> `endpoint_not_found`

## Dampak ke UI Lokal

- Modul 1 tidak bisa dibuktikan penuh karena QR generate gagal
- Modul 2 tidak layak diuji karena endpoint accelerometer visualizer tidak kompatibel
- Modul 3 tidak dilanjutkan karena kontrak backend lintas modul sudah jelas tidak konsisten

## File Screenshot

- Tidak ada screenshot swap test
  Screening dihentikan di tahap probe karena backend partner tidak memenuhi kontrak minimum Versi A repo ini.
