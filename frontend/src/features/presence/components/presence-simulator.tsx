"use client";

import { useMemo, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card/card";
import { Input } from "@/components/ui/inputs";
import { createPresenceSimulationEngine } from "@/features/presence/lib/mock-presence-engine";
import { presenceGasService } from "@/features/presence/services/presence-gas-service";
import type {
  ApiResponse,
  CheckInRequest,
  GenerateQrRequest,
  StatusRequest,
} from "@/features/presence/types";
import { getErrorMessage } from "@/lib/errors";
import { hasGasBaseUrl } from "@/services/gas-client";

type SummaryState = {
  qr_token: string | null;
  expires_at: string | null;
  presence_id: string | null;
  status: string | null;
  last_ts: string | null;
};

type SimulatorMode = "mock" | "gas";

function getCurrentIsoTimestamp() {
  return new Date().toISOString();
}

const DEFAULT_GENERATE_FORM: GenerateQrRequest = {
  course_id: "cloud-101",
  session_id: "sesi-02",
  ts: getCurrentIsoTimestamp(),
};

const DEFAULT_CHECKIN_FORM: CheckInRequest = {
  user_id: "2023xxxx",
  device_id: "dev-001",
  course_id: "cloud-101",
  session_id: "sesi-02",
  qr_token: "",
  ts: getCurrentIsoTimestamp(),
};

const DEFAULT_STATUS_FORM: StatusRequest = {
  user_id: "2023xxxx",
  course_id: "cloud-101",
  session_id: "sesi-02",
};

export default function PresenceSimulator() {
  const engine = useRef(createPresenceSimulationEngine());
  const gasEnabled = hasGasBaseUrl();
  const [generateForm, setGenerateForm] = useState(DEFAULT_GENERATE_FORM);
  const [checkInForm, setCheckInForm] = useState(DEFAULT_CHECKIN_FORM);
  const [statusForm, setStatusForm] = useState(DEFAULT_STATUS_FORM);
  const [mode, setMode] = useState<SimulatorMode>("mock");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<SummaryState>({
    qr_token: null,
    expires_at: null,
    presence_id: null,
    status: null,
    last_ts: null,
  });
  const [lastResponse, setLastResponse] = useState<ApiResponse<unknown> | null>(
    null,
  );

  const formattedResponse = useMemo(() => {
    if (!lastResponse) {
      return JSON.stringify({ ok: true, data: {} }, null, 2);
    }

    return JSON.stringify(lastResponse, null, 2);
  }, [lastResponse]);

  const handleGenerateToken = async () => {
    setIsSubmitting(true);
    try {
      const response =
        mode === "gas"
          ? await presenceGasService.generateToken(generateForm)
          : engine.current.generateToken(generateForm);
      setLastResponse(response);

      if (!response.ok) {
        return;
      }

      setSummary((previous) => ({
        ...previous,
        qr_token: response.data.qr_token,
        expires_at: response.data.expires_at,
      }));

      setCheckInForm((previous) => ({
        ...previous,
        course_id: generateForm.course_id,
        session_id: generateForm.session_id,
        qr_token: response.data.qr_token,
        ts: getCurrentIsoTimestamp(),
      }));

      setStatusForm((previous) => ({
        ...previous,
        course_id: generateForm.course_id,
        session_id: generateForm.session_id,
      }));
    } catch (error) {
      setLastResponse({
        ok: false,
        error: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      const response =
        mode === "gas"
          ? await presenceGasService.checkIn(checkInForm)
          : engine.current.checkIn(checkInForm);
      setLastResponse(response);

      if (!response.ok) {
        return;
      }

      setSummary((previous) => ({
        ...previous,
        presence_id: response.data.presence_id,
        status: response.data.status,
        last_ts: checkInForm.ts,
      }));

      setStatusForm((previous) => ({
        ...previous,
        user_id: checkInForm.user_id,
        course_id: checkInForm.course_id,
        session_id: checkInForm.session_id,
      }));
    } catch (error) {
      setLastResponse({
        ok: false,
        error: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsSubmitting(true);
    try {
      const response =
        mode === "gas"
          ? await presenceGasService.checkStatus(statusForm)
          : engine.current.checkStatus(statusForm);
      setLastResponse(response);

      if (!response.ok) {
        return;
      }

      setSummary((previous) => ({
        ...previous,
        status: response.data.status,
        last_ts: response.data.last_ts,
      }));
    } catch (error) {
      setLastResponse({
        ok: false,
        error: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="simulasi" className="scroll-mt-28 py-10 md:py-14">
      <div className="wrapper">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-(--token-gray-900) dark:text-(--token-white)">
            Simulasi Interaktif
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-(--token-gray-600) dark:text-(--token-gray-300)">
            Simulasi ini menggunakan state lokal untuk meniru perilaku endpoint
            Modul 1. Data akan hilang saat halaman dimuat ulang.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={mode === "mock" ? "primary" : "outline"}
              className="rounded-full"
              onClick={() => setMode("mock")}
              disabled={isSubmitting}
            >
              Mode Mock
            </Button>
            <Button
              size="sm"
              variant={mode === "gas" ? "primary" : "outline"}
              className="rounded-full"
              onClick={() => setMode("gas")}
              disabled={!gasEnabled || isSubmitting}
            >
              Mode GAS
            </Button>
            <span className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
              {gasEnabled
                ? "Mode GAS tersedia melalui NEXT_PUBLIC_GAS_BASE_URL."
                : "Mode GAS nonaktif. Atur NEXT_PUBLIC_GAS_BASE_URL untuk mengaktifkan."}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card
            variant="default"
            size="md"
            className="rounded-2xl"
            header={
              <div>
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  POST /presence/qr/generate
                </p>
                <h3 className="mt-1 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Generate QR Token
                </h3>
              </div>
            }
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  course_id
                </label>
                <Input
                  value={generateForm.course_id}
                  onChange={(event) =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      course_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  session_id
                </label>
                <Input
                  value={generateForm.session_id}
                  onChange={(event) =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      session_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  ts
                </label>
                <Input
                  value={generateForm.ts}
                  onChange={(event) =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      ts: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    setGenerateForm((previous) => ({
                      ...previous,
                      ts: getCurrentIsoTimestamp(),
                    }))
                  }
                >
                  Isi ts saat ini
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleGenerateToken}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Generate"}
                </Button>
              </div>
            </div>
          </Card>

          <Card
            variant="default"
            size="md"
            className="rounded-2xl"
            header={
              <div>
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  POST /presence/checkin
                </p>
                <h3 className="mt-1 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Check-in
                </h3>
              </div>
            }
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  user_id
                </label>
                <Input
                  value={checkInForm.user_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      user_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  device_id
                </label>
                <Input
                  value={checkInForm.device_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      device_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  course_id
                </label>
                <Input
                  value={checkInForm.course_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      course_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  session_id
                </label>
                <Input
                  value={checkInForm.session_id}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      session_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  qr_token
                </label>
                <Input
                  value={checkInForm.qr_token}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      qr_token: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  ts
                </label>
                <Input
                  value={checkInForm.ts}
                  onChange={(event) =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      ts: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    setCheckInForm((previous) => ({
                      ...previous,
                      ts: getCurrentIsoTimestamp(),
                    }))
                  }
                >
                  Isi ts saat ini
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Check-in"}
                </Button>
              </div>
            </div>
          </Card>

          <Card
            variant="default"
            size="md"
            className="rounded-2xl"
            header={
              <div>
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  GET /presence/status
                </p>
                <h3 className="mt-1 text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
                  Cek Status
                </h3>
              </div>
            }
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  user_id
                </label>
                <Input
                  value={statusForm.user_id}
                  onChange={(event) =>
                    setStatusForm((previous) => ({
                      ...previous,
                      user_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  course_id
                </label>
                <Input
                  value={statusForm.course_id}
                  onChange={(event) =>
                    setStatusForm((previous) => ({
                      ...previous,
                      course_id: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--token-gray-600) dark:text-(--token-gray-300)">
                  session_id
                </label>
                <Input
                  value={statusForm.session_id}
                  onChange={(event) =>
                    setStatusForm((previous) => ({
                      ...previous,
                      session_id: event.target.value,
                    }))
                  }
                />
              </div>
              <Button
                size="sm"
                className="rounded-full"
                onClick={handleCheckStatus}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Cek status"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card variant="default" size="md" className="rounded-2xl">
            <h3 className="text-base font-semibold text-(--token-gray-900) dark:text-(--token-white)">
              Ringkasan Simulasi
            </h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="rounded-xl border border-soft p-3">
                <dt className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Token aktif
                </dt>
                <dd className="mt-1 font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                  {summary.qr_token ?? "-"}
                </dd>
              </div>
              <div className="rounded-xl border border-soft p-3">
                <dt className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Batas berlaku token
                </dt>
                <dd className="mt-1 font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                  {summary.expires_at ?? "-"}
                </dd>
              </div>
              <div className="rounded-xl border border-soft p-3">
                <dt className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Presence ID
                </dt>
                <dd className="mt-1 font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                  {summary.presence_id ?? "-"}
                </dd>
              </div>
              <div className="rounded-xl border border-soft p-3">
                <dt className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Status terakhir
                </dt>
                <dd className="mt-1 font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                  {summary.status ?? "-"}
                </dd>
              </div>
              <div className="rounded-xl border border-soft p-3">
                <dt className="text-xs text-(--token-gray-500) dark:text-(--token-gray-400)">
                  Timestamp status
                </dt>
                <dd className="mt-1 font-semibold text-(--token-gray-800) dark:text-(--token-white)">
                  {summary.last_ts ?? "-"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card variant="dark" size="md" className="rounded-2xl">
            <h3 className="text-base font-semibold text-(--token-white)">
              Preview JSON Response
            </h3>
            <p className="mt-2 text-xs text-(--token-white-70)">
              Format sukses: {"{ \"ok\": true, \"data\": { } }"}
              <br />
              Format gagal: {"{ \"ok\": false, \"error\": \"pesan\" }"}
            </p>
            <pre className="mt-4 max-h-[340px] overflow-auto rounded-xl bg-[var(--token-white-10)] p-3 text-xs leading-6 text-(--token-white) custom-scrollbar">
              {formattedResponse}
            </pre>
          </Card>
        </div>
      </div>
    </section>
  );
}
