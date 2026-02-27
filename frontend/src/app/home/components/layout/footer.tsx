import BrandLogo from "@/components/ui/brand-logo";
import { getCurrentYear } from "@/lib/utils";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-soft bg-[var(--color-marketing-light-canvas)] dark:bg-[var(--color-marketing-dark-canvas)]">
      <div className="wrapper py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-2 max-w-xl text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
              Front-end demo Modul 1 presensi QR dinamis dengan login dosen dan
              mahasiswa, terhubung ke backend GAS.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <Link
              href="/#alur"
              className="rounded-full border border-soft px-3 py-1.5 text-(--token-gray-700) hover:text-primary-600 dark:text-(--token-gray-300) dark:hover:text-primary-300"
            >
              Alur
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-soft px-3 py-1.5 text-(--token-gray-700) hover:text-primary-600 dark:text-(--token-gray-300) dark:hover:text-primary-300"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-soft px-3 py-1.5 text-(--token-gray-700) hover:text-primary-600 dark:text-(--token-gray-300) dark:hover:text-primary-300"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <p className="mt-6 border-t border-soft pt-4 text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
          &copy; {getCurrentYear()} CloudTrack Campus - Demo UI Presensi QR Dinamis.
        </p>
      </div>
    </footer>
  );
}
