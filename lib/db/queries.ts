import { normalizeMyPhone } from "@/lib/phone";
import { and, asc, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "./index";
import {
  customers,
  outlets,
  pointLedger,
  purchases,
  redemptions,
  taskClaims,
  taskDefinitions,
  voucherTypes,
} from "./schema";

export async function getCustomer(id: number) {
  const [row] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return row ?? null;
}

export async function getCustomerByPhone(phone: string) {
  const [row] = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1);
  return row ?? null;
}

// Staff can look up a member by the 12-character member code (from the QR) or by phone.
export async function getCustomerByLookup(input: string) {
  const value = input.trim().toUpperCase();
  if (/^[0-9A-F]{12}$/.test(value)) {
    const [row] = await db
      .select()
      .from(customers)
      .where(eq(customers.memberCode, value))
      .limit(1);
    return row ?? null;
  }
  const phone = normalizeMyPhone(input);
  return phone ? getCustomerByPhone(phone) : null;
}

export function getVoucherTypes({ activeOnly = false } = {}) {
  if (activeOnly) {
    return db
      .select()
      .from(voucherTypes)
      .where(eq(voucherTypes.active, true))
      .orderBy(asc(voucherTypes.sortOrder), asc(voucherTypes.id));
  }
  return db
    .select()
    .from(voucherTypes)
    .orderBy(asc(voucherTypes.sortOrder), asc(voucherTypes.id));
}

// The cups voucher defines how many cups earn one free drink.
export async function getCupsVoucherType() {
  const [row] = await db
    .select()
    .from(voucherTypes)
    .where(and(eq(voucherTypes.trigger, "cups"), eq(voucherTypes.active, true)))
    .orderBy(asc(voucherTypes.sortOrder), asc(voucherTypes.id))
    .limit(1);
  return row ?? null;
}

export async function getBalance(customerId: number) {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${pointLedger.delta}), 0)::int`,
    })
    .from(pointLedger)
    .where(eq(pointLedger.customerId, customerId));
  return Number(row?.total ?? 0);
}

export function getLedger(customerId: number, limit = 50) {
  return db
    .select()
    .from(pointLedger)
    .where(eq(pointLedger.customerId, customerId))
    .orderBy(desc(pointLedger.createdAt), desc(pointLedger.id))
    .limit(limit);
}

export function getPurchases(customerId: number, limit = 50) {
  return db
    .select({
      id: purchases.id,
      amountCents: purchases.amountCents,
      points: purchases.points,
      createdAt: purchases.createdAt,
      outletName: outlets.name,
    })
    .from(purchases)
    .innerJoin(outlets, eq(purchases.outletId, outlets.id))
    .where(eq(purchases.customerId, customerId))
    .orderBy(desc(purchases.createdAt))
    .limit(limit);
}

export function getOutlets() {
  return db.select().from(outlets).orderBy(asc(outlets.id));
}

export function getTaskDefinitions() {
  return db
    .select({
      id: taskDefinitions.id,
      kind: taskDefinitions.kind,
      points: taskDefinitions.points,
      url: taskDefinitions.url,
      active: taskDefinitions.active,
      outletId: outlets.id,
      outletName: outlets.name,
    })
    .from(taskDefinitions)
    .innerJoin(outlets, eq(taskDefinitions.outletId, outlets.id))
    .orderBy(asc(outlets.id), asc(taskDefinitions.kind));
}

export async function getTasksWithStatus(customerId: number) {
  const defs = await db
    .select({
      id: taskDefinitions.id,
      kind: taskDefinitions.kind,
      points: taskDefinitions.points,
      url: taskDefinitions.url,
      outletId: outlets.id,
      outletName: outlets.name,
    })
    .from(taskDefinitions)
    .innerJoin(outlets, eq(taskDefinitions.outletId, outlets.id))
    .where(eq(taskDefinitions.active, true))
    .orderBy(asc(outlets.id), asc(taskDefinitions.kind));
  const claims = await db
    .select({ taskId: taskClaims.taskId })
    .from(taskClaims)
    .where(eq(taskClaims.customerId, customerId));
  const claimed = new Set(claims.map((c) => c.taskId));
  return defs.map((d) => ({ ...d, done: claimed.has(d.id) }));
}

export function getRedemptions(customerId: number) {
  return db
    .select({
      ...getTableColumns(redemptions),
      isExpired: sql<boolean>`(${redemptions.expiresAt} IS NOT NULL AND ${redemptions.expiresAt} <= now())`,
    })
    .from(redemptions)
    .where(eq(redemptions.customerId, customerId))
    .orderBy(desc(redemptions.createdAt));
}
