export default function PresenceHero() {
  return (
    <section className="pt-24 pb-14 md:pt-28 md:pb-18">
      <div className="wrapper">
        <div className="relative overflow-hidden rounded-3xl border border-soft surface-elevated p-7 md:p-10">
          <div className="pointer-events-none absolute -left-20 top-2 h-44 w-44 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-52 w-52 rounded-full bg-brand-400/12 blur-3xl" />
          <div className="relative">
            <p className="inline-flex rounded-full accent-soft border border-soft px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
              Praktik Komputasi Awan - Modul 1
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-(--token-gray-900) dark:text-(--token-white) md:text-4xl">
              CloudTrack Campus - Demo UI Presensi QR Dinamis
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300) md:text-base">
              Halaman ini fokus pada alur front-end. Backend Google Apps Script
              belum dihubungkan, sehingga semua aksi generate token, check-in,
              dan cek status masih berjalan dengan state lokal di browser.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-soft px-3 py-1 text-(--token-gray-700) dark:text-(--token-gray-300)">
                Tema utama ungu dipertahankan
              </span>
              <span className="rounded-full border border-soft px-3 py-1 text-(--token-gray-700) dark:text-(--token-gray-300)">
                Respons API mock mengikuti format standar
              </span>
              <span className="rounded-full border border-soft px-3 py-1 text-(--token-gray-700) dark:text-(--token-gray-300)">
                Siap disambungkan ke backend GAS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
