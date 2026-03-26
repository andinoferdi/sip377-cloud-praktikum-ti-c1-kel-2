"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, RefreshCcw, Save, Shuffle } from "lucide-react";
import { useSwapRuntimeConfig } from "@/lib/swap/use-swap-runtime-config";
import { getGasBaseUrl } from "@/services/gas-client";
import {
  createDefaultSwapRuntimeConfig,
  resetSwapRuntimeConfig,
  resolveSwapBaseUrl,
  setSwapRuntimeConfig,
  type SwapEndpointMode,
  type SwapRuntimeConfig,
} from "@/services/swap-runtime-config";

function createDraftFromConfig(config: SwapRuntimeConfig): SwapRuntimeConfig {
  return {
    ...config,
  };
}

type ModeSelectProps = {
  value: SwapEndpointMode;
  onChange: (value: SwapEndpointMode) => void;
};

function ModeSelect({ value, onChange }: ModeSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as SwapEndpointMode)}
      className="h-9 w-full rounded-lg border border-soft bg-(--token-white) px-2.5 text-xs text-(--token-gray-800) outline-none focus:border-primary-500 dark:bg-(--color-surface-dark-subtle) dark:text-(--token-gray-100)"
    >
      <option value="own">Own</option>
      <option value="partner">Partner</option>
    </select>
  );
}

export default function SwapControlPanel() {
  const runtimeConfig = useSwapRuntimeConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftConfig, setDraftConfig] = useState<SwapRuntimeConfig>(() =>
    createDraftFromConfig(runtimeConfig),
  );

  useEffect(() => {
    setDraftConfig(createDraftFromConfig(runtimeConfig));
  }, [runtimeConfig]);

  const envBaseUrl = useMemo(() => getGasBaseUrl(), []);
  const senderResolved = resolveSwapBaseUrl("sender", envBaseUrl, {
    config: draftConfig,
  });
  const visualizerResolved = resolveSwapBaseUrl("visualizer", envBaseUrl, {
    config: draftConfig,
  });

  const needsPartnerUrl =
    draftConfig.enabled &&
    (draftConfig.senderMode === "partner" ||
      draftConfig.visualizerMode === "partner") &&
    draftConfig.partnerBaseUrl.trim() === "";

  function applyPresetSenderToPartner() {
    setDraftConfig((previous) => ({
      ...previous,
      enabled: true,
      senderMode: "partner",
      visualizerMode: "own",
    }));
  }

  function applyPresetSenderToOwn() {
    setDraftConfig((previous) => ({
      ...previous,
      enabled: true,
      senderMode: "own",
      visualizerMode: "partner",
    }));
  }

  function handleSave() {
    const persisted = setSwapRuntimeConfig(draftConfig);
    setDraftConfig(persisted);
  }

  function handleReset() {
    const defaults = resetSwapRuntimeConfig();
    setDraftConfig(defaults);
  }

  return (
    <aside className="pointer-events-none fixed bottom-4 right-4 z-60 flex w-90 max-w-[calc(100vw-1.5rem)] flex-col gap-2">
      <button
        type="button"
        onClick={() => setIsExpanded((previous) => !previous)}
        className="pointer-events-auto inline-flex items-center justify-between rounded-xl border border-soft bg-(--token-white)/95 px-3 py-2 text-left text-xs font-semibold text-(--token-gray-700) shadow-lg backdrop-blur dark:bg-(--color-surface-dark-elevated)/95 dark:text-(--token-gray-200)"
      >
        <span className="inline-flex items-center gap-2">
          <Shuffle size={14} />
          Swap Control
          {runtimeConfig.enabled ? (
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
              ON
            </span>
          ) : (
            <span className="rounded bg-(--token-gray-200) px-1.5 py-0.5 text-[10px] font-bold text-(--token-gray-500) dark:bg-(--token-white-10) dark:text-(--token-gray-400)">
              OFF
            </span>
          )}
        </span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isExpanded ? (
        <div className="pointer-events-auto rounded-xl border border-soft bg-(--token-white)/95 p-3 shadow-xl backdrop-blur dark:bg-(--color-surface-dark-elevated)/95">
          <div className="grid gap-3">
            <label className="inline-flex items-center justify-between gap-3 text-xs font-semibold text-(--token-gray-700) dark:text-(--token-gray-200)">
              Aktifkan mode swap
              <input
                type="checkbox"
                checked={draftConfig.enabled}
                onChange={(event) =>
                  setDraftConfig((previous) => ({
                    ...previous,
                    enabled: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-primary-600"
              />
            </label>

            <div className="grid gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-(--token-gray-500)">
                Own GAS URL
              </p>
              <input
                value={draftConfig.ownBaseUrl}
                onChange={(event) =>
                  setDraftConfig((previous) => ({
                    ...previous,
                    ownBaseUrl: event.target.value,
                  }))
                }
                placeholder={envBaseUrl || "https://script.google.com/.../exec"}
                className="h-9 rounded-lg border border-soft bg-(--token-white) px-2.5 text-xs text-(--token-gray-800) outline-none focus:border-primary-500 dark:bg-(--color-surface-dark-subtle) dark:text-(--token-gray-100)"
              />
            </div>

            <div className="grid gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-(--token-gray-500)">
                Partner GAS URL
              </p>
              <input
                value={draftConfig.partnerBaseUrl}
                onChange={(event) =>
                  setDraftConfig((previous) => ({
                    ...previous,
                    partnerBaseUrl: event.target.value,
                  }))
                }
                placeholder="https://script.google.com/.../exec"
                className="h-9 rounded-lg border border-soft bg-(--token-white) px-2.5 text-xs text-(--token-gray-800) outline-none focus:border-primary-500 dark:bg-(--color-surface-dark-subtle) dark:text-(--token-gray-100)"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-(--token-gray-500)">
                  Sender Target
                </p>
                <ModeSelect
                  value={draftConfig.senderMode}
                  onChange={(value) =>
                    setDraftConfig((previous) => ({
                      ...previous,
                      senderMode: value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-(--token-gray-500)">
                  Visualizer Target
                </p>
                <ModeSelect
                  value={draftConfig.visualizerMode}
                  onChange={(value) =>
                    setDraftConfig((previous) => ({
                      ...previous,
                      visualizerMode: value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={applyPresetSenderToPartner}
                className="rounded-lg border border-soft px-2 py-1.5 text-[11px] font-semibold text-(--token-gray-700) hover:bg-(--token-gray-100) dark:text-(--token-gray-200) dark:hover:bg-(--token-white-5)"
              >
                Preset A
              </button>
              <button
                type="button"
                onClick={applyPresetSenderToOwn}
                className="rounded-lg border border-soft px-2 py-1.5 text-[11px] font-semibold text-(--token-gray-700) hover:bg-(--token-gray-100) dark:text-(--token-gray-200) dark:hover:bg-(--token-white-5)"
              >
                Preset B
              </button>
            </div>

            <div className="rounded-lg border border-soft bg-(--token-gray-50) p-2 text-[11px] dark:bg-(--token-white-5)">
              <p className="font-semibold text-(--token-gray-700) dark:text-(--token-gray-200)">
                Endpoint Aktif
              </p>
              <p className="mt-1 break-all text-(--token-gray-600) dark:text-(--token-gray-300)">
                sender ({senderResolved.source}):{" "}
                {senderResolved.baseUrl || "-"}
              </p>
              <p className="mt-1 break-all text-(--token-gray-600) dark:text-(--token-gray-300)">
                visualizer ({visualizerResolved.source}):{" "}
                {visualizerResolved.baseUrl || "-"}
              </p>
            </div>

            {needsPartnerUrl ? (
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                Mode partner aktif, tapi URL partner masih kosong. Sistem akan fallback ke own URL.
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                <Save size={13} />
                Simpan
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-soft px-3 py-2 text-xs font-semibold text-(--token-gray-700) hover:bg-(--token-gray-100) dark:text-(--token-gray-200) dark:hover:bg-(--token-white-5)"
              >
                <RefreshCcw size={13} />
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

