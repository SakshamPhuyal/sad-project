import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

const AUTH_TOKEN_NAME = "auth_token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type AuthTokenPayload = {
  sub: string;
  exp: number;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET || "dev-only-change-me";
}

function encodeBase64Url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, salt, originalHash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !originalHash) return false;

  const hash = (await scrypt(password, salt, 64)) as Buffer;
  const original = Buffer.from(originalHash, "hex");

  if (hash.length !== original.length) return false;
  return timingSafeEqual(hash, original);
}

export function createAuthToken(userId: string) {
  const payload: AuthTokenPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const given = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as AuthTokenPayload;
    if (!payload?.sub || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  };
}

export { AUTH_TOKEN_NAME };
