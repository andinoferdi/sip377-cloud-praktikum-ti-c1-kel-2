import { useSyncExternalStore } from "react";
import {
  createDefaultSwapRuntimeConfig,
  getSwapRuntimeConfig,
  subscribeSwapRuntimeConfig,
  type SwapRuntimeConfig,
} from "@/services/swap-runtime-config";

const SERVER_SWAP_RUNTIME_SNAPSHOT: SwapRuntimeConfig =
  createDefaultSwapRuntimeConfig();

function getServerSnapshot(): SwapRuntimeConfig {
  return SERVER_SWAP_RUNTIME_SNAPSHOT;
}

export function useSwapRuntimeConfig() {
  return useSyncExternalStore(
    subscribeSwapRuntimeConfig,
    getSwapRuntimeConfig,
    getServerSnapshot,
  );
}
