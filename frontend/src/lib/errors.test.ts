import { ApiError, getErrorMessage } from "@/lib/errors";
import { describe, expect, it } from "vitest";

describe("ApiError", () => {
  it("stores message, name, and status", () => {
    const error = new ApiError("Request gagal", 400);

    expect(error.message).toBe("Request gagal");
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(400);
  });
});

describe("getErrorMessage", () => {
  it("returns message from ApiError", () => {
    const error = new ApiError("Unauthorized", 401);

    expect(getErrorMessage(error)).toBe("Unauthorized");
  });

  it("returns message from Error", () => {
    const error = new Error("Unexpected failure");

    expect(getErrorMessage(error)).toBe("Unexpected failure");
  });

  it("returns fallback for unknown errors", () => {
    expect(getErrorMessage(null)).toBe("Terjadi kesalahan. Coba lagi.");
    expect(getErrorMessage({})).toBe("Terjadi kesalahan. Coba lagi.");
  });
});
