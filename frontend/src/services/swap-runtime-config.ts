export type SwapTargetRole = "sender" | "visualizer";
export type SwapEndpointMode = "own" | "partner";

export type SwapRuntimeConfig = {
  enabled: boolean;
  ownBaseUrl: string;
  partnerBaseUrl: string;
  senderMode: SwapEndpointMode;
  visualizerMode: SwapEndpointMode;
  updatedAt: string;
};

export type SwapResolvedBaseUrl = {
  baseUrl: string;
  source: "unset" | "override" | "env" | "own" | "partner";
};

const SWAP_RUNTIME_CONFIG_STORAGE_KEY = "ctc_swap_runtime_config_v1";
const SWAP_RUNTIME_CONFIG_EVENT = "ctc_swap_runtime_config_updated";
const DEFAULT_SWAP_RUNTIME_CONFIG: SwapRuntimeConfig = {
  enabled: false,
  ownBaseUrl: "",
  partnerBaseUrl: "",
  senderMode: "partner",
  visualizerMode: "own",
  updatedAt: "",
};

let cachedRawConfig: string | null | undefined;
let cachedConfig: SwapRuntimeConfig = DEFAULT_SWAP_RUNTIME_CONFIG;

function isBrowser() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function trimBaseUrl(value: string | null | undefined) {
  return String(value ?? "").trim();
}

function normalizeMode(value: string | null | undefined, fallback: SwapEndpointMode) {
  return value === "own" || value === "partner" ? value : fallback;
}

export function createDefaultSwapRuntimeConfig(): SwapRuntimeConfig {
  return { ...DEFAULT_SWAP_RUNTIME_CONFIG };
}

function normalizeSwapRuntimeConfig(
  input: Partial<SwapRuntimeConfig> | null | undefined,
): SwapRuntimeConfig {
  const defaults = createDefaultSwapRuntimeConfig();
  if (!input) return defaults;

  return {
    enabled: input.enabled === true,
    ownBaseUrl: trimBaseUrl(input.ownBaseUrl),
    partnerBaseUrl: trimBaseUrl(input.partnerBaseUrl),
    senderMode: normalizeMode(input.senderMode, defaults.senderMode),
    visualizerMode: normalizeMode(input.visualizerMode, defaults.visualizerMode),
    updatedAt: trimBaseUrl(input.updatedAt),
  };
}

function safeParseSwapRuntimeConfig(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SwapRuntimeConfig>;
    return normalizeSwapRuntimeConfig(parsed);
  } catch {
    return null;
  }
}

function emitSwapRuntimeConfigUpdated() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(SWAP_RUNTIME_CONFIG_EVENT));
}

export function readSwapRuntimeConfigFromStorage() {
  if (!isBrowser()) return null;
  return safeParseSwapRuntimeConfig(
    window.localStorage.getItem(SWAP_RUNTIME_CONFIG_STORAGE_KEY),
  );
}

export function getSwapRuntimeConfig() {
  if (!isBrowser()) {
    return DEFAULT_SWAP_RUNTIME_CONFIG;
  }

  const rawConfig = window.localStorage.getItem(SWAP_RUNTIME_CONFIG_STORAGE_KEY);
  if (rawConfig === cachedRawConfig) {
    return cachedConfig;
  }

  cachedRawConfig = rawConfig;
  cachedConfig = safeParseSwapRuntimeConfig(rawConfig) ?? DEFAULT_SWAP_RUNTIME_CONFIG;
  return cachedConfig;
}

export function setSwapRuntimeConfig(next: Partial<SwapRuntimeConfig>) {
  if (!isBrowser()) {
    return normalizeSwapRuntimeConfig(next);
  }

  const normalized = normalizeSwapRuntimeConfig({
    ...next,
    updatedAt: new Date().toISOString(),
  });

  const rawConfig = JSON.stringify(normalized);
  window.localStorage.setItem(SWAP_RUNTIME_CONFIG_STORAGE_KEY, rawConfig);
  cachedRawConfig = rawConfig;
  cachedConfig = normalized;
  emitSwapRuntimeConfigUpdated();
  return normalized;
}

export function updateSwapRuntimeConfig(patch: Partial<SwapRuntimeConfig>) {
  const current = getSwapRuntimeConfig();
  return setSwapRuntimeConfig({
    ...current,
    ...patch,
  });
}

export function resetSwapRuntimeConfig() {
  if (!isBrowser()) {
    return createDefaultSwapRuntimeConfig();
  }

  window.localStorage.removeItem(SWAP_RUNTIME_CONFIG_STORAGE_KEY);
  cachedRawConfig = null;
  cachedConfig = DEFAULT_SWAP_RUNTIME_CONFIG;
  emitSwapRuntimeConfigUpdated();
  return DEFAULT_SWAP_RUNTIME_CONFIG;
}

export function subscribeSwapRuntimeConfig(listener: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SWAP_RUNTIME_CONFIG_STORAGE_KEY) {
      listener();
    }
  };

  const onCustomEvent = () => {
    listener();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SWAP_RUNTIME_CONFIG_EVENT, onCustomEvent);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SWAP_RUNTIME_CONFIG_EVENT, onCustomEvent);
  };
}

function resolveOwnSource(
  ownBaseUrl: string,
  envBaseUrl: string,
): SwapResolvedBaseUrl {
  if (ownBaseUrl) {
    return { baseUrl: ownBaseUrl, source: "own" };
  }

  if (envBaseUrl) {
    return { baseUrl: envBaseUrl, source: "env" };
  }

  return { baseUrl: "", source: "unset" };
}

export function resolveSwapBaseUrl(
  targetRole: SwapTargetRole,
  envBaseUrl: string,
  options: {
    baseUrlOverride?: string;
    config?: SwapRuntimeConfig;
  } = {},
): SwapResolvedBaseUrl {
  const overrideBaseUrl = trimBaseUrl(options.baseUrlOverride);
  if (overrideBaseUrl) {
    return {
      baseUrl: overrideBaseUrl,
      source: "override",
    };
  }

  const config = normalizeSwapRuntimeConfig(options.config ?? getSwapRuntimeConfig());
  const ownBaseUrl = trimBaseUrl(config.ownBaseUrl);
  const partnerBaseUrl = trimBaseUrl(config.partnerBaseUrl);
  const normalizedEnvBaseUrl = trimBaseUrl(envBaseUrl);
  const ownResolution = resolveOwnSource(ownBaseUrl, normalizedEnvBaseUrl);

  if (!config.enabled) {
    return ownResolution;
  }

  const mode = targetRole === "sender" ? config.senderMode : config.visualizerMode;
  if (mode === "partner") {
    if (partnerBaseUrl) {
      return {
        baseUrl: partnerBaseUrl,
        source: "partner",
      };
    }
    return ownResolution;
  }

  return ownResolution;
}
