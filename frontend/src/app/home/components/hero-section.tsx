import Link from "next/link";

const STATS = [
  { value: "10", label: "API Endpoints" },
  { value: "3", label: "Modul Aktif" },
  { value: "4", label: "Google Sheets" },
] as const;

const TAGS = [
  "Presensi QR Dinamis",
  "Accelerometer Telemetry",
  "GPS Tracking + Peta",
] as const;

export default function HeroSection() {
  return (
    <section className="pt-24 pb-14 md:pt-28 md:pb-18">
      <div className="wrapper">
        <div className="relative overflow-hidden rounded-3xl border border-soft surface-elevated p-7 md:p-10 lg:p-14">
          <div className="pointer-events-none absolute -left-24 -top-10 h-64 w-64 rounded-full bg-primary-500/12 blur-[80px]" />
          <div className="pointer-events-none absolute right-0 top-10 h-56 w-56 rounded-full bg-brand-400/14 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-primary-300/8 blur-[60px]" />

          <div className="relative">
            <p className="inline-flex rounded-full accent-soft border border-soft px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
              Praktik Komputasi Awan - SIP377
            </p>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-(--token-gray-900) dark:text-(--token-white) md:text-4xl lg:text-[44px] lg:leading-[52px]">
              CloudTrack Campus
            </h1>

            <p className="mt-2 max-w-2xl text-lg font-medium text-primary-600 dark:text-primary-300 md:text-xl">
              Platform Cloud untuk Kampus Cerdas
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-(--token-gray-600) dark:text-(--token-gray-300) md:text-base md:leading-7">
              Sistem berbasis Google Apps Script dan Google Sheets yang
              mengintegrasikan presensi QR dinamis, telemetri accelerometer, dan
              pelacakan GPS dalam satu platform. Dibangun dengan arsitektur
              API-only untuk interoperabilitas lintas kelompok.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-soft px-3 py-1.5 text-xs font-medium text-(--token-gray-700) dark:text-(--token-gray-300) transition-colors hover:border-primary-300 hover:text-primary-700 dark:hover:border-primary-600 dark:hover:text-primary-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="gradient-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Masuk Dashboard
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative mt-10 grid grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-soft p-4 text-center transition-colors hover:border-primary-300/40 dark:hover:border-primary-600/40"
                style={{
                  background: "rgba(148,163,184,0.04)",
                }}
              >
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-300 md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-(--token-gray-500) dark:text-(--token-gray-400)">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
