"use client";

import { useEffect, useMemo, useState } from "react";
import { useSwapRuntimeConfig } from "@/lib/swap/use-swap-runtime-config";
import { getGasBaseUrl } from "@/services/gas-client";
import {
  resolveSwapBaseUrl,
  type SwapResolvedBaseUrl,
} from "@/services/swap-runtime-config";

const UNSET_RESOLUTION: SwapResolvedBaseUrl = {
  baseUrl: "",
  source: "unset",
};

type SwapBackendAvailability = {
  isHydrated: boolean;
  hasSenderBackend: boolean;
  hasVisualizerBackend: boolean;
  resolvedBaseUrl: {
    sender: SwapResolvedBaseUrl;
    visualizer: SwapResolvedBaseUrl;
  };
};

export function useSwapBackendAvailability(): SwapBackendAvailability {
  const runtimeConfig = useSwapRuntimeConfig();
  const [isHydrated, setIsHydrated] = useState(false);
  const envBaseUrl = useMemo(() => getGasBaseUrl(), []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const senderResolved = useMemo(() => {
    if (!isHydrated) return UNSET_RESOLUTION;
    return resolveSwapBaseUrl("sender", envBaseUrl, {
      config: runtimeConfig,
    });
  }, [envBaseUrl, isHydrated, runtimeConfig]);

  const visualizerResolved = useMemo(() => {
    if (!isHydrated) return UNSET_RESOLUTION;
    return resolveSwapBaseUrl("visualizer", envBaseUrl, {
      config: runtimeConfig,
    });
  }, [envBaseUrl, isHydrated, runtimeConfig]);

  return {
    isHydrated,
    hasSenderBackend: senderResolved.baseUrl.length > 0,
    hasVisualizerBackend: visualizerResolved.baseUrl.length > 0,
    resolvedBaseUrl: {
      sender: senderResolved,
      visualizer: visualizerResolved,
    },
  };
}
