import { describe, expect, it } from "vitest";
import { normalizeStopSessionErrorMessage } from "@/lib/home/qr-stop-errors";

describe("normalizeStopSessionErrorMessage", () => {
  it("maps unknown endpoint stop error to actionable message", () => {
    const result = normalizeStopSessionErrorMessage(
      "unknown_endpoint: POST ?path=presence/qr/stop",
    );

    expect(result).toBe(
      "Gagal menghentikan sesi: backend belum mendukung endpoint stop. Minta deploy backend terbaru.",
    );
  });

  it("keeps generic stop prefix for other errors", () => {
    const result = normalizeStopSessionErrorMessage("network timeout");
    expect(result).toBe("Gagal menghentikan sesi: network timeout");
  });
});
