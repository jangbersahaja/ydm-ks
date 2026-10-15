import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

// Stored as "salt:hash" (hex). scrypt keeps the staff passwords out of plain text.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = scryptSync(password, salt, KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}
