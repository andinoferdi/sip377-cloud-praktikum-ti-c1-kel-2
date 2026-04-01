import { fetcher } from "@/services/fetcher";
import {
  resolveSwapBaseUrl,
  type SwapTargetRole,
} from "@/services/swap-runtime-config";

type Primitive = string | number | boolean;

type QueryParams = Record<string, Primitive | null | undefined>;

type GasRequestOptions = {
  method?: "GET" | "POST";
  query?: QueryParams;
  json?: unknown;
  signal?: AbortSignal;
  targetRole?: SwapTargetRole;
  baseUrlOverride?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeGasPath(path: string) {
  return path.replace(/^\/+/, "");
}

const GAS_BASE_URL_PREFIX = "NEXT_PUBLIC_GAS_BASE_URL=";

function stripWrappedQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
}

export function normalizeGasBaseUrl(value: string | null | undefined) {
  let normalized = String(value ?? "").trim();

  while (normalized.startsWith(GAS_BASE_URL_PREFIX)) {
    normalized = normalized.slice(GAS_BASE_URL_PREFIX.length).trim();
  }

  return stripWrappedQuotes(normalized);
}

export function getGasBaseUrl() {
  return normalizeGasBaseUrl(process.env.NEXT_PUBLIC_GAS_BASE_URL);
}

export function getResolvedGasBaseUrl(
  targetRole: SwapTargetRole = "visualizer",
  baseUrlOverride?: string,
) {
  return resolveSwapBaseUrl(targetRole, getGasBaseUrl(), {
    baseUrlOverride,
  }).baseUrl;
}

export function hasGasBaseUrl(
  targetRole: SwapTargetRole = "visualizer",
  baseUrlOverride?: string,
) {
  return getResolvedGasBaseUrl(targetRole, baseUrlOverride).length > 0;
}

type BuildGasUrlOptions = {
  targetRole?: SwapTargetRole;
  baseUrlOverride?: string;
};

export function buildGasUrl(
  path: string,
  query?: QueryParams,
  options: BuildGasUrlOptions = {},
) {
  const resolved = resolveSwapBaseUrl(
    options.targetRole ?? "visualizer",
    getGasBaseUrl(),
    {
      baseUrlOverride: options.baseUrlOverride,
    },
  );
  const base = resolved.baseUrl;
  if (!base) {
    throw new Error(
      "GAS base URL belum diatur untuk role ini. Atur env atau Swap Control runtime.",
    );
  }

  const url = new URL(trimTrailingSlash(base));
  const normalizedPath = normalizeGasPath(path);

  if (normalizedPath) {
    url.searchParams.set("path", normalizedPath);
  }

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function requestGas<T>(
  path: string,
  options: GasRequestOptions = {},
) {
  const method = options.method ?? "GET";
  const url = buildGasUrl(path, options.query, {
    targetRole: options.targetRole,
    baseUrlOverride: options.baseUrlOverride,
  });

  if (method === "POST" && options.json !== undefined) {
    return fetcher<T>(url, {
      method,
      body: JSON.stringify(options.json),
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      redirect: "follow",
      signal: options.signal,
    });
  }

  return fetcher<T>(url, {
    method,
    redirect: "follow",
    signal: options.signal,
  });
}
