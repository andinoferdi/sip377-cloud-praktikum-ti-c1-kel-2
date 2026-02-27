import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/app/login/components/login-form";
import BrandLogo from "@/components/ui/brand-logo";

export const metadata: Metadata = {
  title: "Login",
};

const FEATURES = [
  {
    title: "Presensi QR Dinamis",
    description: "Token otomatis berganti, anti titip absen",
  },
  {
    title: "Accelerometer Telemetry",
    description: "Batch upload data sensor smartphone",
  },
  {
    title: "GPS Tracking + Peta",
    description: "Marker, polyline, dan history lokasi",
  },
] as const;

export default function LoginPage() {
  return (
    <section className="flex min-h-dvh bg-(--color-marketing-light-canvas) dark:bg-(--color-marketing-dark-canvas)">
      {/* Left branding panel - hidden on mobile */}
      <div className="relative hidden w-[45%] overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-500) 50%, var(--color-brand-400) 100%)",
          }}
        />

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="md" priority />
          </Link>
          <h2 className="mt-10 max-w-sm text-3xl font-bold leading-tight text-white xl:text-4xl">
            Platform Cloud untuk Kampus Cerdas
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Sistem terintegrasi berbasis Google Apps Script untuk presensi,
            telemetri, dan pelacakan lokasi.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-bold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {feature.title}
                </p>
                <p className="mt-0.5 text-xs text-white/60">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
        {/* Mobile header */}
        <div className="mb-8 w-full max-w-[420px] lg:hidden">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="md" priority />
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="rounded-3xl border border-(--token-gray-200) bg-(--token-white) p-7 shadow-theme-sm dark:border-(--color-marketing-dark-border) dark:bg-(--color-surface-dark-subtle) sm:p-10">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-(--token-gray-800) dark:text-(--token-white-90)">
                Masuk ke CloudTrack
              </h1>
              <p className="mt-2 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
                Gunakan NIM atau NIP dan password untuk mengakses dashboard.
              </p>
            </div>

            <LoginForm />
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-(--token-gray-500) transition-colors hover:text-primary-600 dark:text-(--token-gray-400) dark:hover:text-primary-300"
            >
              <ArrowLeft size={14} />
              Kembali ke Landing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
