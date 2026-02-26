const FLOW_STEPS = [
  {
    title: "Generate QR Token",
    description:
      "Dosen atau admin membuat token QR berdasarkan course_id dan session_id.",
  },
  {
    title: "Mahasiswa Scan dan Check-in",
    description:
      "Client mengirim user_id, device_id, course_id, session_id, qr_token, dan ts.",
  },
  {
    title: "Server Validasi",
    description:
      "Token harus valid dan belum kadaluarsa. Jika valid, presensi disimpan.",
  },
  {
    title: "Status Presensi",
    description:
      "Status per user dapat dicek cepat melalui kombinasi user_id, course_id, dan session_id.",
  },
] as const;

export default function PresenceFlow() {
  return (
    <section id="alur" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
            Alur End-to-End
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
            Urutan proses berikut dipakai sebagai acuan demo UI. Anda bisa
            mengujinya di mode mock atau mode GAS.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {FLOW_STEPS.map((step, index) => (
            <article
              key={step.title}
              className="surface-elevated rounded-2xl border border-soft p-5"
            >
              <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                Langkah {index + 1}
              </p>
              <h3 className="mt-2 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-(--token-gray-600) dark:text-(--token-gray-300)">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
