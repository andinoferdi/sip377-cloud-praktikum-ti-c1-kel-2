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
      <div className="wrapper py-10 md:py-14">
        {/* Top section */}
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-(--token-gray-500) dark:text-(--token-gray-400)">
              Platform cloud computing untuk presensi QR dinamis, telemetri
              accelerometer, dan pelacakan GPS kampus. Dibangun dalam
              Praktik Komputasi Awan SIP377.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500)">
              Navigasi
            </h4>
            <ul className="mt-3 space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-(--token-gray-600) transition-colors hover:text-primary-600 dark:text-(--token-gray-300) dark:hover:text-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-(--token-gray-400) dark:text-(--token-gray-500)">
              Tech Stack
            </h4>
            <ul className="mt-3 space-y-2.5">
              {TECH_STACK.map((tech) => (
                <li
                  key={tech}
                  className="text-sm text-(--token-gray-600) dark:text-(--token-gray-300)"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
            &copy; {getCurrentYear()} CloudTrack Campus &mdash; Praktik
            Komputasi Awan SIP377
          </p>
          <p className="text-xs text-(--token-gray-400) dark:text-(--token-gray-500)">
            TI-C1 Kelompok 2
          </p>
        </div>
      </div>
    </footer>
  );
}
