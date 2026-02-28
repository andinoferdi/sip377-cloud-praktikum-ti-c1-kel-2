import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/app/login/components/login-form";
import BrandLogo from "@/components/ui/brand-logo";

export const metadata: Metadata = {
  title: "Login",
};

const FEATURES = [
  { number: "01", label: "Presensi QR Dinamis" },
  { number: "02", label: "Accelerometer Telemetry" },
  { number: "03", label: "GPS Tracking + Peta" },
] as const;

export default function LoginPage() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-16 bg-(--color-marketing-light-canvas) dark:bg-(--color-marketing-dark-canvas)">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #64748b 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Back link */}
      <div className="relative w-full max-w-[400px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-(--token-gray-400) transition-colors hover:text-(--token-gray-700) dark:text-(--token-gray-500) dark:hover:text-(--token-gray-200)"
        >
          <ArrowLeft size={12} />
          Kembali ke Landing
        </Link>
      </div>

      {/* Card */}
      <div className="relative mt-5 w-full max-w-[400px] overflow-hidden rounded-2xl border border-soft surface-elevated">
        {/* Card header */}
        <div className="border-b border-soft px-8 py-6">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="md" priority />
          </Link>
          <h1 className="mt-5 text-xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
            Masuk ke CloudTrack
          </h1>
          <p className="mt-1.5 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
            Gunakan NIM atau NIP dan password Anda.
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <LoginForm />
        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-3 divide-x divide-soft border-t border-soft">
          {FEATURES.map((feat) => (
            <div key={feat.number} className="px-3 py-3.5 text-center">
              <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
                {feat.number}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-(--token-gray-400) dark:text-(--token-gray-500)">
                {feat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="relative mt-6 text-center text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
        Praktik Komputasi Awan &mdash; SIP377 &middot; TI-C1 Kelompok 2
      </p>
    </section>
  );
}