import { afterEach, describe, expect, it } from "vitest";
import { buildGasUrl, hasGasBaseUrl } from "@/services/gas-client";

const ORIGINAL_GAS_BASE_URL = process.env.NEXT_PUBLIC_GAS_BASE_URL;

describe("gas-client", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_GAS_BASE_URL = ORIGINAL_GAS_BASE_URL;
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
});
