import { AUTH_MAX_AGE_SECONDS, getAuthConfig } from "./config";
import { secretsEqual } from "./secrets";

interface SessionPayload {
  u: string;
  exp: number;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of array) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(signature);
}

export async function createSessionToken(username: string) {
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + AUTH_MAX_AGE_SECONDS * 1000,
  };
  const encoded = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const signature = await sign(getAuthConfig().secret, encoded);
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = await sign(getAuthConfig().secret, encoded);
  if (!(await secretsEqual(signature, expected))) return null;

  try {
    const json = atob(
      encoded.replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat((4 - (encoded.length % 4)) % 4)
    );
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.u || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
