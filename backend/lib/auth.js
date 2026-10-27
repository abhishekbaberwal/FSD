"use strict";
/**
 * Password hashing and session-token helpers.
 * Uses only Node's built-in `crypto` module (no npm dependencies).
 */
const crypto = require("crypto");

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Hash a password -> "scrypt$<saltHex>$<hashHex>" */
function hashPassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("Password must be a non-empty string");
  }
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** Constant-time check of a password against a stored hash. */
function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  // Reject anything that isn't exactly what hashPassword() produces. Without this, a
  // corrupt entry such as "scrypt$$" decodes to empty buffers, which compare equal and
  // would accept ANY password.
  const HEX = /^[0-9a-f]+$/i;
  if (!HEX.test(parts[1]) || !HEX.test(parts[2])) return false;
  try {
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    if (salt.length !== SALT_BYTES || expected.length !== SCRYPT_KEYLEN) return false;
    const actual = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
    return crypto.timingSafeEqual(expected, actual);
  } catch (err) {
    return false;
  }
}

/** Random, URL-safe session token (sent to the client once). */
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/** Only a SHA-256 of the token is stored server-side, never the token itself. */
function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

/** Read the bearer token from an Authorization header value, or null. */
function parseBearer(headerValue) {
  if (typeof headerValue !== "string") return null;
  const m = /^Bearer\s+([A-Za-z0-9_\-]+)$/.exec(headerValue.trim());
  return m ? m[1] : null;
}

module.exports = { SESSION_TTL_MS, hashPassword, verifyPassword, generateToken, hashToken, parseBearer };
