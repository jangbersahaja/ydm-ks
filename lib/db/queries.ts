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

export async function getCustomerByVoucherCode(code: string) {
  const [row] = await db
    .select({ customer: customers })
    .from(redemptions)
    .innerJoin(customers, eq(redemptions.customerId, customers.id))
    .where(eq(redemptions.code, code.trim().toUpperCase()))
    .limit(1);
  return row?.customer ?? null;
}

// Also accepts a voucher code and resolves to the voucher owner.
export async function getCustomerByMemberInput(input: string) {
  const customer = await getCustomerByLookup(input);
  if (customer) return customer;
  return getCustomerByVoucherCode(input);
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

// `redeemed` counts every claim of a type, `used` counts claims marked used at the counter.
export async function getVoucherUsage() {
  const rows = await db
    .select({
      voucherTypeId: redemptions.voucherTypeId,
      redeemed: sql<number>`count(*)::int`,
      used: sql<number>`count(*) filter (where ${redemptions.status} = 'redeemed')::int`,
    })
    .from(redemptions)
    .groupBy(redemptions.voucherTypeId);
  const usage: Record<number, { redeemed: number; used: number }> = {};
  for (const row of rows) {
    if (row.voucherTypeId === null) continue;
    usage[row.voucherTypeId] = { redeemed: row.redeemed, used: row.used };
  }
  return usage;
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

const PAGE_SIZE = 10;

// Clamps the requested page to the available range so stale links still render.
function paginate(page: number, total: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  return { page: current, totalPages, offset: (current - 1) * pageSize };
}

export async function getRecentPurchases(
  page = 1,
  outletId?: number,
  pageSize = PAGE_SIZE,
) {
  const filter =
    outletId === undefined ? undefined : eq(purchases.outletId, outletId);
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(purchases)
    .where(filter);
  const pager = paginate(page, total, pageSize);
  const rows = await db
    .select({
      id: purchases.id,
      customerName: customers.name,
      outletName: outlets.name,
      amountCents: purchases.amountCents,
      discountCents: purchases.discountCents,
      voucherName: redemptions.rewardName,
      points: purchases.points,
      cups: purchases.cups,
      createdAt: purchases.createdAt,
    })
    .from(purchases)
    .innerJoin(customers, eq(purchases.customerId, customers.id))
    .innerJoin(outlets, eq(purchases.outletId, outlets.id))
    .leftJoin(redemptions, eq(purchases.redemptionId, redemptions.id))
    .where(filter)
    .orderBy(desc(purchases.createdAt), desc(purchases.id))
    .limit(pageSize)
    .offset(pager.offset);
  return { rows, total, page: pager.page, totalPages: pager.totalPages };
}

export function getOutlets() {
  return db.select().from(outlets).orderBy(asc(outlets.id));
}

export async function getOutletByCode(code: string) {
  const [row] = await db
    .select()
    .from(outlets)
    .where(eq(outlets.code, code))
    .limit(1);
  return row ?? null;
}

export async function getOutletById(id: number) {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .select()
    .from(outlets)
    .where(eq(outlets.id, id))
    .limit(1);
  return row ?? null;
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

// Highest active points per task kind across outlets.
export async function getActiveTaskPoints() {
  const rows = await db
    .select({
      kind: taskDefinitions.kind,
      points: sql<number>`max(${taskDefinitions.points})`.mapWith(Number),
    })
    .from(taskDefinitions)
    .where(eq(taskDefinitions.active, true))
    .groupBy(taskDefinitions.kind);
  return Object.fromEntries(rows.map((r) => [r.kind, r.points])) as Partial<
    Record<string, number>
  >;
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
