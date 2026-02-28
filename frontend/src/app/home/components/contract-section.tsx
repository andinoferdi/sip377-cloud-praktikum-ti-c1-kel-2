const CONTRACT_GROUPS = [
  {
    module: "Presensi QR",
    tag: "Modul 01",
    endpoints: [
      { method: "POST", path: "/presence/qr/generate" },
      { method: "POST", path: "/presence/checkin" },
      { method: "GET", path: "/presence/status" },
      { method: "GET", path: "/presence/list" },
    ],
  },
  {
    module: "Accelerometer",
    tag: "Modul 02",
    endpoints: [
      { method: "POST", path: "/telemetry/accel" },
      { method: "GET", path: "/telemetry/accel/latest" },
    ],
  },
  {
    module: "GPS Tracking",
    tag: "Modul 03",
    endpoints: [
      { method: "POST", path: "/telemetry/gps" },
      { method: "GET", path: "/telemetry/gps/latest" },
      { method: "GET", path: "/telemetry/gps/history" },
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

const DATA_STANDARDS = [
  "Timestamp wajib ISO-8601 UTC",
  "Request dan response menggunakan JSON",
  "Prefix token: TKN-, prefix presence: PR-",
  "POST ke GAS gunakan Content-Type: text/plain",
] as const;

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  const styles =
    method === "GET"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40";
  return (
    <span
      className={`inline-flex w-10 shrink-0 items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-bold leading-none ${styles}`}
    >
      {method}
    </span>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-soft">
      {/* Terminal bar */}
      <div className="flex items-center justify-between border-b border-soft bg-(--token-gray-50) px-4 py-2.5 dark:bg-(--token-white-5)">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-(--token-gray-200) dark:bg-(--token-white-10)" />
          <span className="h-2.5 w-2.5 rounded-full bg-(--token-gray-200) dark:bg-(--token-white-10)" />
          <span className="h-2.5 w-2.5 rounded-full bg-(--token-gray-200) dark:bg-(--token-white-10)" />
        </div>
        <p className="text-[10px] font-medium text-(--token-gray-400) dark:text-(--token-gray-500)">
          {label}
        </p>
      </div>
      <pre className="overflow-x-auto bg-(--token-gray-100) p-4 text-xs leading-6 text-(--token-gray-800) dark:bg-(--token-gray-900) dark:text-(--token-gray-200)">
        {code}
      </pre>
    </div>
  );
}

export default function ContractSection() {
  return (
    <section id="kontrak" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        {/* Section header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            API Contract
          </p>
          <h2 className="mt-2 text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white) md:text-3xl">
            Kontrak API Simple v1
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--token-gray-500) dark:text-(--token-gray-400) md:text-base">
            Semua kelompok memakai format endpoint dan response yang sama.
            Client mana pun bisa menguji server mana pun tanpa mengubah bentuk
            data.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left: endpoint groups */}
          <div className="space-y-3">
            {CONTRACT_GROUPS.map((group) => (
              <div
                key={group.module}
                className="overflow-hidden rounded-2xl border border-soft surface-elevated"
              >
                {/* Group header */}
                <div className="flex items-center justify-between border-b border-soft px-5 py-3.5">
                  <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                    {group.module}
                  </h3>
                  <span className="rounded-md border border-soft px-2 py-0.5 text-[10px] font-semibold text-(--token-gray-400) dark:text-(--token-gray-500)">
                    {group.tag}
                  </span>
                </div>

                {/* Endpoints */}
                <div className="divide-y divide-soft">
                  {group.endpoints.map((ep) => (
                    <div
                      key={`${ep.method}-${ep.path}`}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <MethodBadge method={ep.method} />
                      <code className="text-xs text-(--token-gray-700) dark:text-(--token-gray-300)">
                        {ep.path}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: response examples + standards */}
          <div className="space-y-4">
            <CodeBlock code={SAMPLE_SUCCESS} label="200 OK — Sukses" />
            <CodeBlock code={SAMPLE_ERROR} label="4xx — Gagal" />

            {/* Data standards */}
            <div className="rounded-2xl border border-soft surface-elevated p-5">
              <h3 className="text-sm font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                Standar Format Data
              </h3>
              <ul className="mt-4 space-y-2.5">
                {DATA_STANDARDS.map((std) => (
                  <li
                    key={std}
                    className="flex items-start gap-2.5 text-xs leading-relaxed text-(--token-gray-600) dark:text-(--token-gray-300)"
                  >
                    <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    {std}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}