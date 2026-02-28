import BrandLogo from "@/components/ui/brand-logo";
import { getCurrentYear } from "@/lib/utils";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/#modul", label: "Modul" },
  { href: "/#kontrak", label: "Kontrak API" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

const TECH_STACK = [
  "Next.js 16",
  "Google Apps Script",
  "Google Sheets",
  "TanStack Query",
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-soft bg-(--color-marketing-light-canvas) dark:bg-(--color-marketing-dark-canvas)">
      <div className="wrapper">
        <div className="grid gap-10 py-12 md:grid-cols-[1.8fr_1fr_1fr] md:py-16">
          <div>
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-(--token-gray-500) dark:text-(--token-gray-400)">
              Platform cloud computing untuk presensi QR dinamis, telemetri
              accelerometer, dan pelacakan GPS kampus. Dibangun dalam Praktik
              Komputasi Awan SIP377.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500)">
              Navigasi
            </p>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--token-gray-600) transition-colors hover:text-(--token-gray-900) dark:text-(--token-gray-400) dark:hover:text-(--token-white)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500)">
              Tech Stack
            </p>
            <ul className="mt-4 space-y-2.5">
              {TECH_STACK.map((tech) => (
                <li
                  key={tech}
                  className="flex items-center gap-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-400)"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-(--token-gray-300) dark:bg-(--token-gray-600)" />
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-soft py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
            &copy; {getCurrentYear()} CloudTrack Campus &mdash; Praktik
            Komputasi Awan SIP377
          </p>
          <p className="text-xs font-medium text-(--token-gray-400) dark:text-(--token-gray-500)">
            TI-C1 Kelompok 2
          </p>
        </div>
      </div>
    </footer>
  );
}