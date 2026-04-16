# Kel Sofie

## Ringkasan

Kel Sofie `tidak kompatibel` untuk swap backend dengan aplikasi lokal ini.

- `Link GAS` tidak merespons sebagai API JSON seperti kontrak repo ini.
- Probe awal untuk endpoint GPS mengembalikan HTML Apps Script runner, bukan respons `ok/data/error`.
- Karena kontrak API inti tidak bisa diverifikasi, swap test browser tidak dilanjutkan.

## Identitas Partner

- Kelompok: `kel sofie`
- Link GAS: `https://script.google.com/macros/s/AKfycbzNhS3xjFThWv4PSE8v3Z7CKK8JeEZfk18Rk9Hs-9xZxxY6fz5xPfJVeWZbTvffM01i/exec`
- Link Deploy: `https://cloudcomputing-project-eight.vercel.app/`
- Kesimpulan akhir: `tidak kompatibel`

## Hasil Probe Awal

- `telemetry/gps/latest` -> mengembalikan HTML Apps Script runner, bukan JSON API
- Kontrak minimum Modul 1-3 tidak bisa divalidasi dari respons awal

## Dampak ke UI Lokal

- `Swap Control` tidak layak diarahkan ke partner ini untuk demo swap asli karena visualizer dan sender repo lokal mengharapkan JSON kontrak backend
- Swap test browser dihentikan di tahap screening agar tidak menghasilkan bukti palsu

## File Screenshot

- Tidak ada screenshot swap test
  Screening dihentikan di tahap probe karena backend partner tidak kompatibel sebagai API publik repo ini.
