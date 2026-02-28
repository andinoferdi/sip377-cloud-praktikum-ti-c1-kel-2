// =========================================================
//  Konfigurasi Modul 1: Presensi QR Dinamis — Kelompok 3
// =========================================================

// URL deployment GAS — bisa di-override via env var NEXT_PUBLIC_BASE_URL
export const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://script.google.com/macros/s/AKfycbyjIOkUsGNK8BO9tPfbJctVBxrj2bppvvcWABzi0sXDfx8r6zdTHvthQ0L93pg_6u74hA/exec';

// Durasi token dalam menit (harus sama dengan TOKEN_EXPIRY_MINUTES di Code.gs)
export const TOKEN_EXPIRY_MINUTES = 2;
