import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const PASSWORD_HASH_PREFIX = "scrypt";

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${hash}`;
};

export const verifyPassword = (
  password: string,
  passwordHash: string
): boolean => {
  const [prefix, salt, hash] = passwordHash.split("$");

  if (
    prefix !== PASSWORD_HASH_PREFIX ||
    !salt ||
    !hash ||
    hash.length !== KEY_LENGTH * 2
  ) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  const stored = Buffer.from(hash, "hex");
  const current = Buffer.from(derivedHash, "hex");

  if (stored.length !== current.length) {
    return false;
  }

  return timingSafeEqual(stored, current);
};
