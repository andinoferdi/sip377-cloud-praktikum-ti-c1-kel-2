import { afterEach, describe, expect, it, vi } from "vitest";

const fetcherMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/fetcher", () => ({
  fetcher: fetcherMock,
}));

import { buildGasUrl, hasGasBaseUrl, requestGas } from "@/services/gas-client";

const ORIGINAL_GAS_BASE_URL = process.env.NEXT_PUBLIC_GAS_BASE_URL;

describe("gas-client", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_GAS_BASE_URL = ORIGINAL_GAS_BASE_URL;
    fetcherMock.mockReset();
  });

  it("builds GAS url using query param path", () => {
    process.env.NEXT_PUBLIC_GAS_BASE_URL =
      "https://script.google.com/macros/s/DEPLOYMENT/exec";

    const url = buildGasUrl("/presence/qr/generate", {
      course_id: "cloud-101",
      session_id: "sesi-02",
    });

    expect(url).toContain("/exec?");
    expect(url).toContain("path=presence%2Fqr%2Fgenerate");
    expect(url).toContain("course_id=cloud-101");
    expect(url).toContain("session_id=sesi-02");
  });

  it("reports base url availability", () => {
    process.env.NEXT_PUBLIC_GAS_BASE_URL = "";
    expect(hasGasBaseUrl()).toBe(false);

    process.env.NEXT_PUBLIC_GAS_BASE_URL =
      "https://script.google.com/macros/s/DEPLOYMENT/exec";
    expect(hasGasBaseUrl()).toBe(true);
  });

  it("sends GAS POST as simple request with text/plain body", async () => {
    process.env.NEXT_PUBLIC_GAS_BASE_URL =
      "https://script.google.com/macros/s/DEPLOYMENT/exec";
    fetcherMock.mockResolvedValueOnce({ ok: true });

    await requestGas("/presence/qr/generate", {
      method: "POST",
      json: { course_id: "cloud-101", session_id: "sesi-02" },
    });

    expect(fetcherMock).toHaveBeenCalledTimes(1);
    const [calledUrl, requestInit] = fetcherMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(calledUrl).toContain("path=presence%2Fqr%2Fgenerate");
    expect(requestInit.body).toBe(
      JSON.stringify({ course_id: "cloud-101", session_id: "sesi-02" }),
    );
    expect((requestInit.headers as Record<string, string>)["Content-Type"]).toBe(
      "text/plain;charset=UTF-8",
    );
  });
});
