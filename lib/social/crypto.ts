/**
 * Token encryption (AES-256-GCM) + OAuth state signing (HMAC-SHA256).
 *
 * Key: SOCIAL_TOKEN_KEY env — 32 bytes as 64 hex chars (or base64). Generate:
 *   openssl rand -hex 32
 * If the env is missing in mock/dev mode a deterministic dev key is derived
 * and a warning is printed once; with REAL platform credentials configured
 * the adapters call `requireTokenKey()` which fails loud instead.
 *
 * All functions take the key explicitly so they are pure and unit-testable;
 * `getTokenKey()` / `requireTokenKey()` are the only env-touching helpers.
 */

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "crypto"

const ALG = "aes-256-gcm"
const VERSION = "v1"

/** Accepts 64 hex chars (preferred) or 32-byte base64. */
export function parseKey(raw: string): Buffer {
  const trimmed = raw.trim()
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return Buffer.from(trimmed, "hex")
  const key = Buffer.from(trimmed, "base64")
  if (key.length !== 32) {
    throw new Error("SOCIAL_TOKEN_KEY must be 32 bytes (64 hex chars) — generate with: openssl rand -hex 32")
  }
  return key
}

/** Loud failure for real-credential paths: no key → no token storage. */
export function requireTokenKey(): Buffer {
  const env = process.env.SOCIAL_TOKEN_KEY
  if (!env || env.trim().length === 0) {
    throw new Error(
      "SOCIAL_TOKEN_KEY is required when real social credentials are configured — generate: openssl rand -hex 32"
    )
  }
  return parseKey(env)
}

let warnedDevKey = false

/** Env key, or a derived dev-only fallback so mock mode runs with zero setup. */
export function getTokenKey(): { key: Buffer; usingDevFallback: boolean } {
  const env = process.env.SOCIAL_TOKEN_KEY
  if (env && env.trim().length > 0) return { key: parseKey(env.trim()), usingDevFallback: false }
  if (!warnedDevKey) {
    warnedDevKey = true
    console.warn(
      "[social] SOCIAL_TOKEN_KEY is not set — using a dev fallback key. " +
        "Set it in production: openssl rand -hex 32"
    )
  }
  const seed = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "menu-p"
  return { key: createHash("sha256").update(`menu-p-social-dev-key:${seed}`).digest(), usingDevFallback: true }
}

// ---------------------------------------------------------------------------
// AES-256-GCM token encryption — output format: v1.<iv>.<ciphertext>.<tag>
// (each part base64url; tag is the GCM auth tag → tamper detection built in)
// ---------------------------------------------------------------------------

export function encryptToken(plaintext: string, key: Buffer): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALG, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString("base64url"), ciphertext.toString("base64url"), tag.toString("base64url")].join(".")
}

/** Throws on tampering, wrong key, or malformed payload. */
export function decryptToken(payload: string, key: Buffer): string {
  const parts = payload.split(".")
  if (parts.length !== 4 || parts[0] !== VERSION) throw new Error("Invalid encrypted token format")
  const [, ivB64, dataB64, tagB64] = parts
  const decipher = createDecipheriv(ALG, key, Buffer.from(ivB64, "base64url"))
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"))
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64url")), decipher.final()]).toString("utf8")
}

// ---------------------------------------------------------------------------
// Signed OAuth state (CSRF protection for the connect → callback round-trip)
// ---------------------------------------------------------------------------

export interface OAuthState {
  restaurantId: string
  platform: string
  /** Random nonce — also stored in an httpOnly cookie and compared back. */
  nonce: string
  /** Unix ms expiry. */
  exp: number
}

export function createNonce(): string {
  return randomBytes(16).toString("base64url")
}

function stateHmac(body: string, key: Buffer): string {
  return createHmac("sha256", key).update(body).digest("base64url")
}

export function signState(state: OAuthState, key: Buffer): string {
  const body = Buffer.from(JSON.stringify(state), "utf8").toString("base64url")
  return `${body}.${stateHmac(body, key)}`
}

/** Returns the state when the signature is valid and not expired, else null. */
export function verifyState(raw: string, key: Buffer, nowMs: number = Date.now()): OAuthState | null {
  const dot = raw.lastIndexOf(".")
  if (dot <= 0) return null
  const body = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expected = stateHmac(body, key)
  const sigBuf = Buffer.from(sig, "base64url")
  const expBuf = Buffer.from(expected, "base64url")
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<OAuthState>
    if (
      typeof parsed.restaurantId !== "string" ||
      typeof parsed.platform !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null
    }
    if (parsed.exp < nowMs) return null
    return parsed as OAuthState
  } catch {
    return null
  }
}
