import { ADMIN_COOKIE, CUSTOMER_COOKIE } from "@/lib/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE = 60 * 60 * 24 * 30;

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("hex");
}

function pack(value: string) {
  return `${value}.${sign(value)}`;
}

function unpack(raw: string | undefined): string | null {
  if (!raw) return null;
  const idx = raw.lastIndexOf(".");
  if (idx < 0) return null;
  const value = raw.slice(0, idx);
  const signature = raw.slice(idx + 1);
  const expected = sign(value);
  if (signature.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ? value
    : null;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export async function setCustomerSession(customerId: number) {
  (await cookies()).set(
    CUSTOMER_COOKIE,
    pack(String(customerId)),
    cookieOptions,
  );
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function getCustomerId(): Promise<number | null> {
  const value = unpack((await cookies()).get(CUSTOMER_COOKIE)?.value);
  const id = value ? Number(value) : NaN;
  return Number.isInteger(id) ? id : null;
}

export async function requireCustomerId(): Promise<number> {
  const id = await getCustomerId();
  if (id === null) redirect("/login");
  return id;
}

export async function setAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, pack("admin"), cookieOptions);
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  return unpack((await cookies()).get(ADMIN_COOKIE)?.value) === "admin";
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
