type ModuleAccent = "purple" | "blue" | "green";

const MODULES: {
  number: string;
  title: string;
  accent: ModuleAccent;
  description: string;
  endpoints: readonly string[];
  features: readonly string[];
}[] = [
  {
    number: "01",
    title: "Presensi QR Dinamis",
    accent: "purple",
    description:
      "QR code yang berganti otomatis untuk mencegah titip absen. Dosen membuat token, mahasiswa scan dan check-in, status langsung terverifikasi.",
    endpoints: [
      "POST /presence/qr/generate",
      "POST /presence/checkin",
      "GET  /presence/status",
      "GET  /presence/list",
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
    accent: "blue",
    description:
      "Kirim data sensor accelerometer dari smartphone secara batch ke cloud. Ambil pembacaan terbaru kapan saja untuk monitoring aktivitas.",
    endpoints: [
      "POST /telemetry/accel",
      "GET  /telemetry/accel/latest",
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
    accent: "green",
    description:
      "Lacak lokasi GPS perangkat, tampilkan posisi terkini sebagai marker dan jejak perjalanan sebagai polyline di peta.",
    endpoints: [
      "POST /telemetry/gps",
      "GET  /telemetry/gps/latest",
      "GET  /telemetry/gps/history",
    ],
    features: [
      "Log lat, lng, accuracy, altitude",
      "Marker posisi terbaru per device",
      "History dengan limit dan window waktu",
      "Polyline urut naik berdasarkan timestamp",
    ],
  },
];

const accentConfig: Record<
  ModuleAccent,
  {
    number: string;
    dot: string;
    label: string;
    endpointBg: string;
  }
> = {
  purple: {
    number:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
    dot: "bg-violet-500 dark:bg-violet-400",
    label:
      "text-violet-600 dark:text-violet-400",
    endpointBg:
      "bg-violet-50/60 border-violet-100 text-violet-900 dark:bg-violet-950/30 dark:border-violet-800/40 dark:text-violet-200",
  },
  blue: {
    number:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
    dot: "bg-sky-500 dark:bg-sky-400",
    label:
      "text-sky-600 dark:text-sky-400",
    endpointBg:
      "bg-sky-50/60 border-sky-100 text-sky-900 dark:bg-sky-950/30 dark:border-sky-800/40 dark:text-sky-200",
  },
  green: {
    number:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    label:
      "text-emerald-600 dark:text-emerald-400",
    endpointBg:
      "bg-emerald-50/60 border-emerald-100 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-200",
  },
};

export default function FlowSection() {
  return (
    <section id="modul" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Platform Features
            </p>
            <h2 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
              Tiga Modul, Satu Platform
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-relaxed text-(--token-gray-500) dark:text-(--token-gray-400) lg:block">
            Setiap modul memiliki endpoint API terstandar yang bisa diuji silang
            antar kelompok.
          </p>
        </div>

        {/* Module cards */}
        <div className="grid gap-px rounded-2xl border border-soft overflow-hidden bg-soft lg:grid-cols-3">
          {MODULES.map((mod) => {
            const acc = accentConfig[mod.accent];
            return (
              <article
                key={mod.number}
                className="surface-elevated flex flex-col gap-0 p-0"
              >
                {/* Card header */}
                <div className="flex items-start gap-4 border-b border-soft p-6">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${acc.number}`}
                  >
                    {mod.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white) leading-snug">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-(--token-gray-500) dark:text-(--token-gray-400)">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Endpoints */}
                <div className="border-b border-soft p-6">
                  <p
                    className={`mb-3 text-[10px] font-semibold uppercase tracking-widest ${acc.label}`}
                  >
                    Endpoints
                  </p>
                  <div className="space-y-1.5">
                    {mod.endpoints.map((ep) => (
                      <p
                        key={ep}
                        className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] leading-relaxed ${acc.endpointBg}`}
                      >
                        {ep}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="p-6">
                  <p
                    className={`mb-3 text-[10px] font-semibold uppercase tracking-widest ${acc.label}`}
                  >
                    Fitur Utama
                  </p>
                  <ul className="space-y-2">
                    {mod.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-xs leading-relaxed text-(--token-gray-600) dark:text-(--token-gray-300)"
                      >
                        <span
                          className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${acc.dot}`}
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-4 text-center text-xs text-(--token-gray-400) dark:text-(--token-gray-500) lg:hidden">
          Setiap modul memiliki endpoint API terstandar yang bisa diuji silang
          antar kelompok.
        </p>
      </div>
    </section>
  );
}