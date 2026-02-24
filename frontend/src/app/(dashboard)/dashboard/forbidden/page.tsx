import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section className="rounded-2xl border border-(--token-gray-200) bg-(--token-white) p-6 dark:border-(--token-gray-800) dark:bg-(--token-gray-900)">
      <h1 className="text-2xl font-semibold text-(--token-gray-800) dark:text-(--token-white-90)">
        Akses Ditolak
      </h1>
      <p className="mt-3 text-sm text-(--token-gray-500) dark:text-(--token-gray-400)">
        Role Anda tidak punya permission untuk membuka halaman ini.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-flex rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-(--token-white) hover:bg-primary-600"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </section>
  );
}
