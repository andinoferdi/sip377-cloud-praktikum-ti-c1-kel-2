const CONTRACT_GROUPS = [
  {
    module: "Presensi QR",
    endpoints: [
      "POST /presence/qr/generate",
      "POST /presence/checkin",
      "GET  /presence/status?user_id=...&course_id=...&session_id=...",
      "GET  /presence/list?course_id=...&session_id=...&limit=...",
    ],
  },
  {
    module: "Accelerometer",
    endpoints: [
      "POST /telemetry/accel",
      "GET  /telemetry/accel/latest?device_id=...",
    ],
  },
  {
    module: "GPS Tracking",
    endpoints: [
      "POST /telemetry/gps",
      "GET  /telemetry/gps/latest?device_id=...",
      "GET  /telemetry/gps/history?device_id=...&limit=...&from=...&to=...",
    ],
  },
] as const;

const SAMPLE_SUCCESS = `{
  "ok": true,
  "data": {
    "presence_id": "PR-0001",
    "status": "checked_in"
  }
}`;

const SAMPLE_ERROR = `{
  "ok": false,
  "error": "token_expired"
}`;

export default function ContractSection() {
  return (
    <section id="kontrak" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        <div className="rounded-3xl border border-soft surface-elevated p-6 md:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            API Contract
          </p>
          <h2 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
            Kontrak API Simple v1
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-(--token-gray-600) dark:text-(--token-gray-300) md:text-base">
            Semua kelompok memakai format endpoint dan response yang sama.
            Client mana pun bisa menguji server mana pun tanpa mengubah bentuk
            data.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              {CONTRACT_GROUPS.map((group) => (
                <div
                  key={group.module}
                  className="rounded-2xl border border-soft p-4"
                >
                  <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                    {group.module}
                  </h3>
                  <div className="mt-3 space-y-1.5">
                    {group.endpoints.map((ep) => (
                      <p
                        key={ep}
                        className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-(--token-gray-700) dark:text-(--token-gray-300)"
                        style={{
                          background: "rgba(148,163,184,0.07)",
                          border: "1px solid rgba(148,163,184,0.12)",
                        }}
                      >
                        {ep}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-soft p-4">
                <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Response Envelope - Sukses
                </h3>
                <pre className="mt-3 rounded-xl bg-(--token-gray-100) p-3 text-xs leading-6 text-(--token-gray-800) dark:bg-(--token-white-5) dark:text-(--token-white-90)">
                  {SAMPLE_SUCCESS}
                </pre>
              </div>

              <div className="rounded-2xl border border-soft p-4">
                <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Response Envelope - Gagal
                </h3>
                <pre className="mt-3 rounded-xl bg-(--token-gray-100) p-3 text-xs leading-6 text-(--token-gray-800) dark:bg-(--token-white-5) dark:text-(--token-white-90)">
                  {SAMPLE_ERROR}
                </pre>
              </div>

              <div className="rounded-2xl border border-soft p-4">
                <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Standar Format Data
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    Timestamp wajib ISO-8601 UTC
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    Request dan response menggunakan JSON
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    Prefix token: TKN-, prefix presence: PR-
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    POST ke GAS gunakan Content-Type: text/plain
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
