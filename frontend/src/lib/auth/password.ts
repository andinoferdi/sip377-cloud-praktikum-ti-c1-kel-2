import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import { utf8ToBytes } from "@noble/hashes/utils";
import { compareSync } from "bcryptjs";

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) {
    throw new Error("invalid_salt_hex");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  if (typeof btoa === "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

export async function pbkdf2Sha256Base64(
  password: string,
  saltHex: string,
  iterations: number,
) {
  const saltBytes = hexToBytes(saltHex);
  const cryptoSubtle = globalThis.crypto?.subtle;

  if (!cryptoSubtle) {
    // Fallback for non-secure contexts that don't expose WebCrypto Subtle API.
    const derivedBytes = pbkdf2(sha256, utf8ToBytes(password), saltBytes, {
      c: iterations,
      dkLen: 32,
    });
    return bytesToBase64(derivedBytes);
  }

  const textEncoder = new TextEncoder();
  const keyMaterial = await cryptoSubtle.importKey("raw", textEncoder.encode(password), { name: "PBKDF2" }, false, [
    "deriveBits",
  ]);

  const derivedBits = await cryptoSubtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBytes,
      iterations,
    },
    keyMaterial,
    256,
  );

  return bytesToBase64(new Uint8Array(derivedBits));
}

export async function verifyPasswordHash(params: {
  password: string;
  saltHex?: string;
  expectedHash: string;
  iterations?: number;
}) {
  if (/^\$2[aby]\$\d{2}\$/.test(params.expectedHash)) {
    return compareSync(params.password, params.expectedHash);
  }

  if (!params.saltHex || !params.iterations) {
    throw new Error("missing_pbkdf2_params");
  }

  const actualHash = await pbkdf2Sha256Base64(
    params.password,
    params.saltHex,
    params.iterations,
  );
  return actualHash === params.expectedHash;
}
