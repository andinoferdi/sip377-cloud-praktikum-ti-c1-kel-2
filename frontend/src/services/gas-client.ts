import { fetcher } from "@/services/fetcher";

type Primitive = string | number | boolean;

type QueryParams = Record<string, Primitive | null | undefined>;

type GasRequestOptions = {
  method?: "GET" | "POST";
  query?: QueryParams;
  json?: unknown;
  signal?: AbortSignal;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeGasPath(path: string) {
  return path.replace(/^\/+/, "");
}

export function getGasBaseUrl() {
  return (process.env.NEXT_PUBLIC_GAS_BASE_URL ?? "").trim();
}

export function hasGasBaseUrl() {
  return getGasBaseUrl().length > 0;
}

export function buildGasUrl(path: string, query?: QueryParams) {
  const base = getGasBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_GAS_BASE_URL belum diatur. Mode direct GAS tidak tersedia.",
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
  const url = buildGasUrl(path, options.query);

  if (method === "POST" && options.json !== undefined) {
    return fetcher<T>(url, {
      method,
      body: JSON.stringify(options.json),
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
