const MODULES = [
  {
    number: "01",
    title: "Presensi QR Dinamis",
    accent: "rgba(185,118,252,0.12)",
    accentBorder: "rgba(185,118,252,0.25)",
    accentText: "#a25be7",
    darkAccentText: "#d3a8fe",
    description:
      "QR code yang berganti otomatis untuk mencegah titip absen. Dosen membuat token, mahasiswa scan dan check-in, status langsung terverifikasi.",
    endpoints: [
      "POST /presence/qr/generate",
      "POST /presence/checkin",
      "GET /presence/status",
      "GET /presence/list",
    ],
    features: [
      "Token TTL 2 menit, rotasi otomatis",
      "Validasi qr_token + course_id + session_id",
      "Satu token untuk banyak mahasiswa",
      "Status real-time per user",
    ],
  },
  {
    number: "02",
    title: "Accelerometer Telemetry",
    accent: "rgba(11,165,236,0.12)",
    accentBorder: "rgba(11,165,236,0.25)",
    accentText: "#0086c9",
    darkAccentText: "#7cd4fd",
    description:
      "Kirim data sensor accelerometer dari smartphone secara batch ke cloud. Ambil pembacaan terbaru kapan saja untuk monitoring aktivitas.",
    endpoints: [
      "POST /telemetry/accel",
      "GET /telemetry/accel/latest",
    ],
    features: [
      "Batch upload (samples[])",
      "Simpan x, y, z per sample",
      "Latest per device_id",
      "Insert batch efisien dengan setValues()",
    ],
  },
  {
    number: "03",
    title: "GPS Tracking + Peta",
    accent: "rgba(18,183,106,0.12)",
    accentBorder: "rgba(18,183,106,0.25)",
    accentText: "#039855",
    darkAccentText: "#6ce9a6",
    description:
      "Lacak lokasi GPS perangkat, tampilkan posisi terkini sebagai marker dan jejak perjalanan sebagai polyline di peta.",
    endpoints: [
      "POST /telemetry/gps",
      "GET /telemetry/gps/latest",
      "GET /telemetry/gps/history",
    ],
    features: [
      "Log lat, lng, accuracy, altitude",
      "Marker posisi terbaru per device",
      "History dengan limit dan window waktu",
      "Polyline urut naik berdasarkan timestamp",
    ],
  },
] as const;

export default function FlowSection() {
  return (
    <section id="modul" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Platform Features
          </p>
          <h2 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
            Tiga Modul, Satu Platform
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--token-gray-600) dark:text-(--token-gray-300) md:text-base">
            Setiap modul memiliki endpoint API terstandar yang bisa diuji silang
            antar kelompok. Backend GAS menyimpan data ke Google Sheets dengan
            kontrak response seragam.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {MODULES.map((mod) => (
            <article
              key={mod.number}
              className="group surface-elevated rounded-2xl border border-soft p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    background: mod.accent,
                    border: `1px solid ${mod.accentBorder}`,
                    color: mod.accentText,
                  }}
                >
                  {mod.number}
                </span>
                <h3 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  {mod.title}
                </h3>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-(--token-gray-600) dark:text-(--token-gray-300)">
                {mod.description}
              </p>

              <div className="mt-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                  Endpoints
                </p>
                <div className="space-y-1.5">
                  {mod.endpoints.map((ep) => (
                    <p
                      key={ep}
                      className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-(--token-gray-700) dark:text-(--token-gray-300)"
                      style={{
                        background: "rgba(148,163,184,0.07)",
                        border: "1px solid rgba(148,163,184,0.12)",
                      }}
                    >
                      {ep}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--token-gray-400) dark:text-(--token-gray-500)">
                  Fitur Utama
                </p>
                <ul className="space-y-1.5 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
                  {mod.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: mod.accentText }}
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
