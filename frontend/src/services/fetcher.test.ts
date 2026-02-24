import { ApiError } from "@/lib/errors";
import { fetcher } from "@/services/fetcher";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("fetcher", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await fetcher<{ status: string }>("/api/health");

    expect(result).toEqual({ status: "ok" });
  });

  it("sets content-type only when json payload is provided", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await fetcher<{ ok: boolean }>("/api/health", {
      method: "POST",
      json: { ok: true },
    });

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = requestInit.headers as Headers;

    expect(headers.get("Content-Type")).toBe("application/json");
    expect(requestInit.body).toBe(JSON.stringify({ ok: true }));

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await fetcher<{ ok: boolean }>("/api/health", {
      method: "POST",
      body: "raw-body",
    });

    const secondRequestInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const secondHeaders = secondRequestInit.headers as Headers;

    expect(secondHeaders.get("Content-Type")).toBeNull();
  });

  it("throws ApiError with json message on http error", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 422,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(fetcher("/api/health")).rejects.toMatchObject({
      name: "ApiError",
      message: "Invalid payload",
      status: 422,
    });
  });

  it("throws ApiError with text fallback on non-json http error", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("Service unavailable", {
        status: 503,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(fetcher("/api/health")).rejects.toMatchObject({
      name: "ApiError",
      message: "Service unavailable",
      status: 503,
    });
  });

  it("throws ApiError with status 0 on network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network failed"));

    await expect(fetcher("/api/health")).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        message: "Network failed",
        status: 0,
      }),
    );
  });
});
