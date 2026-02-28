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
        <div className="relative overflow-hidden rounded-3xl border border-soft surface-elevated">
          {/* Subtle dot grid background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #64748b 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Top accent bar */}
          <div className="relative flex items-center gap-3 border-b border-soft px-7 py-4 md:px-10 lg:px-14">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Praktik Komputasi Awan — SIP377
            </p>
          </div>

          <div className="relative grid gap-0 lg:grid-cols-[1fr_auto]">
            {/* Left: main content */}
            <div className="border-b border-soft p-7 md:p-10 lg:border-b-0 lg:border-r lg:p-14">
              <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.08] tracking-tight text-(--token-gray-900) dark:text-(--token-white)">
                CloudTrack
                <br />
                <span className="text-primary-600 dark:text-primary-400">
                  Campus
                </span>
              </h1>

              <p className="mt-4 text-base font-medium text-(--token-gray-500) dark:text-(--token-gray-400) md:text-lg">
                Platform Cloud untuk Kampus Cerdas
              </p>

              <p className="mt-5 max-w-xl text-sm leading-7 text-(--token-gray-600) dark:text-(--token-gray-300) md:text-base md:leading-8">
                Sistem berbasis Google Apps Script dan Google Sheets yang
                mengintegrasikan presensi QR dinamis, telemetri accelerometer,
                dan pelacakan GPS dalam satu platform dengan arsitektur
                API-only untuk interoperabilitas lintas kelompok.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-soft bg-transparent px-3 py-1.5 text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:hover:opacity-90"
                >
                  Masuk Dashboard
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 7h8M7 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: stats panel */}
            <div className="grid grid-cols-3 divide-x divide-soft lg:grid-cols-1 lg:divide-x-0 lg:divide-y lg:w-52">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center px-4 py-6 text-center lg:py-10"
                >
                  <p className="text-3xl font-bold tabular-nums text-(--token-gray-900) dark:text-(--token-white) md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-(--token-gray-400) dark:text-(--token-gray-500)">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}