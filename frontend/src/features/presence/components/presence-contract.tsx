const CONTRACT_ITEMS = [
  "POST /presence/qr/generate",
  "POST /presence/checkin",
  "GET /presence/status?user_id=...&course_id=...&session_id=...",
] as const;

const SAMPLE_RESPONSE = `{
  "ok": true,
  "data": {
    "presence_id": "PR-0001",
    "status": "checked_in"
  }
}`;

export default function PresenceContract() {
  return (
    <section id="kontrak" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        <div className="rounded-3xl border border-soft surface-elevated p-6 md:p-8">
          <h2 className="text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
            Kontrak API Modul 1
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
            UI ini menyiapkan struktur payload dan respons sesuai kontrak
            minimum. Saat backend GAS siap, form dapat langsung disambungkan ke
            endpoint final tanpa mengubah bentuk data.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-2xl border border-soft p-4">
              <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                Endpoint minimum
              </h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-(--token-gray-700) dark:text-(--token-gray-300)">
                {CONTRACT_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-soft p-4">
              <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                Contoh respons check-in sukses
              </h3>
              <pre className="mt-3 rounded-xl bg-[var(--token-gray-100)] p-3 text-xs leading-6 text-(--token-gray-800) dark:bg-[var(--token-white-5)] dark:text-(--token-white-90)">
                {SAMPLE_RESPONSE}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
