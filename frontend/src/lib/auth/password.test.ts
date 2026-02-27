import { describe, expect, it } from "vitest";
import { hashSync } from "bcryptjs";
import { AUTH_SEED_USERS } from "@/schemas/seeder";
import { verifyPasswordHash } from "@/lib/auth/password";

describe("auth-password", () => {
  it("verifies seeded student password", async () => {
    const user = AUTH_SEED_USERS.find((seed) => seed.identifier === "434231079");
    if (!user) {
      throw new Error("seed mahasiswa not found");
    }

    const isValid = await verifyPasswordHash({
      password: "434231079",
      saltHex: user.salt,
      expectedHash: user.password_hash,
      iterations: user.iterations,
    });

    expect(isValid).toBe(true);
  });

  it("rejects invalid password", async () => {
    const user = AUTH_SEED_USERS[1];

    const isValid = await verifyPasswordHash({
      password: "wrong-password",
      saltHex: user.salt,
      expectedHash: user.password_hash,
      iterations: user.iterations,
    });

    expect(isValid).toBe(false);
  });

  it("verifies seeded student with special-char password", async () => {
    const user = AUTH_SEED_USERS.find((seed) => seed.identifier === "434231065");
    if (!user) {
      throw new Error("seed mahasiswa not found");
    }

    const isValid = await verifyPasswordHash({
      password: "Kediri123#",
      saltHex: user.salt,
      expectedHash: user.password_hash,
      iterations: user.iterations,
    });

    expect(isValid).toBe(true);
  });

  it("verifies bcrypt hash", async () => {
    const expectedHash = hashSync("Kediri123#", 10);
    const isValid = await verifyPasswordHash({
      password: "Kediri123#",
      expectedHash,
    });
    expect(isValid).toBe(true);
  });
});
