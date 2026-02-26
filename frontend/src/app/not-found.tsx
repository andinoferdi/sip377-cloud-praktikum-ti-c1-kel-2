import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="surface-base flex min-h-[70vh] items-center">
      <div className="wrapper">
        <div className="mx-auto max-w-2xl rounded-3xl border border-soft surface-elevated p-8 text-center md:p-10">
          <p className="inline-flex rounded-full accent-soft border border-soft px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-3 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
            Tautan yang Anda buka tidak tersedia. Kembali ke halaman utama
            untuk melanjutkan simulasi presensi.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-(--token-white) transition-colors hover:bg-primary-600"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </section>
  );
}
