import { and, asc, eq, gte, like, lt, type SQL, sql } from "drizzle-orm";
import { db } from "./index";
import {
  customers,
  outlets,
  pointLedger,
  purchases,
  redemptions,
} from "./schema";

export const RANGES = ["7d", "30d", "90d", "all"] as const;
export type AnalyticsRange = (typeof RANGES)[number];

// A member is dormant when their last purchase is older than this.
export const DORMANT_DAYS = 60;

const DAY_MS = 86_400_000;
const RANGE_DAYS: Record<AnalyticsRange, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
};
// Bucket and hour boundaries follow Malaysia time, not the server clock.
const LOCAL_TZ = sql.raw("'Asia/Kuala_Lumpur'");

export function parseRange(value?: string): AnalyticsRange {
  return RANGES.find((range) => range === value) ?? "30d";
}

function rangeStart(range: AnalyticsRange) {
  const days = RANGE_DAYS[range];
  return days === null ? null : new Date(Date.now() - days * DAY_MS);
}

// Day buckets for short ranges, weeks for 90 days, months for all time.
function bucketSql(range: AnalyticsRange) {
  const [unit, format] =
    range === "all"
      ? ["month", "YYYY-MM"]
      : range === "90d"
        ? ["week", "YYYY-MM-DD"]
        : ["day", "YYYY-MM-DD"];
  return sql<string>`to_char(date_trunc(${sql.raw(`'${unit}'`)}, ${purchases.createdAt} AT TIME ZONE ${LOCAL_TZ}), ${sql.raw(`'${format}'`)})`;
}

// Sums are cast to float8 so the driver returns JS numbers, not strings.
const paidCents = sql<number>`coalesce(sum(${purchases.amountCents} - ${purchases.discountCents}), 0)::float8`;

export async function getSalesSummary(range: AnalyticsRange) {
  const start = rangeStart(range);
  const where = start ? gte(purchases.createdAt, start) : undefined;
  const bucket = bucketSql(range);
  const hour = sql<number>`extract(hour from ${purchases.createdAt} AT TIME ZONE ${LOCAL_TZ})::int`;

  const [totalRows, series, byOutlet, byHour] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        paidCents,
        discountCents: sql<number>`coalesce(sum(${purchases.discountCents}), 0)::float8`,
      })
      .from(purchases)
      .where(where),
    db
      .select({
        bucket,
        count: sql<number>`count(*)::int`,
        paidCents,
      })
      .from(purchases)
      .where(where)
      .groupBy(bucket)
      .orderBy(bucket),
    db
      .select({
        name: outlets.name,
        count: sql<number>`count(*)::int`,
        paidCents,
      })
      .from(purchases)
      .innerJoin(outlets, eq(purchases.outletId, outlets.id))
      .where(where)
      .groupBy(outlets.id, outlets.name)
      .orderBy(asc(outlets.id)),
    db
      .select({ hour, count: sql<number>`count(*)::int` })
      .from(purchases)
      .where(where)
      .groupBy(hour)
      .orderBy(hour),
  ]);

  const totals = totalRows[0] ?? { count: 0, paidCents: 0, discountCents: 0 };
  return {
    count: totals.count,
    paidCents: totals.paidCents,
    discountCents: totals.discountCents,
    averageTicketCents:
      totals.count > 0 ? Math.round(totals.paidCents / totals.count) : 0,
    series,
    byOutlet,
    byHour,
  };
}

export async function getMemberSummary(range: AnalyticsRange) {
  const start = rangeStart(range);
  const purchasesInRange = start ? gte(purchases.createdAt, start) : undefined;
  const perMember = db
    .select({
      customerId: purchases.customerId,
      visits: sql<number>`count(*)::int`.as("visits"),
    })
    .from(purchases)
    .where(purchasesInRange)
    .groupBy(purchases.customerId)
    .as("per_member");
  const lastVisit = db
    .select({
      customerId: purchases.customerId,
      last: sql<Date>`max(${purchases.createdAt})`.as("last"),
    })
    .from(purchases)
    .groupBy(purchases.customerId)
    .as("last_visit");
  const dormantBefore = new Date(Date.now() - DORMANT_DAYS * DAY_MS);

  const [totalRows, signupRows, activeRows, neverRows, dormantRows] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(customers),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(start ? gte(customers.createdAt, start) : undefined),
      db
        .select({
          active: sql<number>`count(*)::int`,
          repeat: sql<number>`count(*) filter (where ${perMember.visits} >= 2)::int`,
        })
        .from(perMember),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(
          sql`not exists (select 1 from ${purchases} where ${purchases.customerId} = ${customers.id})`,
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(lastVisit)
        .where(lt(lastVisit.last, dormantBefore)),
    ]);

  const active = activeRows[0]?.active ?? 0;
  const repeat = activeRows[0]?.repeat ?? 0;
  return {
    total: totalRows[0]?.count ?? 0,
    signups: signupRows[0]?.count ?? 0,
    active,
    repeatRate: active > 0 ? repeat / active : 0,
    neverPurchased: neverRows[0]?.count ?? 0,
    dormant: dormantRows[0]?.count ?? 0,
  };
}

export async function getPointsSummary(range: AnalyticsRange) {
  const start = rangeStart(range);
  const inRange = start ? gte(pointLedger.createdAt, start) : undefined;
  const sumOf = (condition: SQL) =>
    sql<number>`coalesce(sum(${pointLedger.delta}) filter (where ${condition}), 0)::int`;

  const [flow] = await db
    .select({
      purchase: sumOf(eq(pointLedger.reason, "purchase")),
      firstPurchaseBonus: sumOf(eq(pointLedger.reason, "bonus:first_purchase")),
      tasks: sumOf(like(pointLedger.reason, "task:%")),
      redeemed: sumOf(eq(pointLedger.reason, "redeem")),
      adjusted: sumOf(eq(pointLedger.reason, "adjust")),
    })
    .from(pointLedger)
    .where(inRange);

  // Every ledger row counts, so this is not limited by the range.
  const [liability] = await db
    .select({
      outstanding: sql<number>`coalesce(sum(${pointLedger.delta}), 0)::int`,
    })
    .from(pointLedger);

  return {
    purchase: flow?.purchase ?? 0,
    firstPurchaseBonus: flow?.firstPurchaseBonus ?? 0,
    tasks: flow?.tasks ?? 0,
    // Redeem rows are stored as negative deltas.
    redeemed: Math.abs(flow?.redeemed ?? 0),
    adjusted: flow?.adjusted ?? 0,
    outstanding: liability?.outstanding ?? 0,
  };
}

export async function getVoucherSummary(range: AnalyticsRange) {
  const start = rangeStart(range);
  const issuedInRange = start ? gte(redemptions.createdAt, start) : undefined;

  const [totalRows, byVoucher, byOutlet] = await Promise.all([
    db
      .select({
        issued: sql<number>`count(*)::int`,
        used: sql<number>`count(*) filter (where ${redemptions.status} = 'redeemed')::int`,
        activeUnused: sql<number>`count(*) filter (where ${redemptions.status} = 'issued' and (${redemptions.expiresAt} is null or ${redemptions.expiresAt} > now()))::int`,
        expiredUnused: sql<number>`count(*) filter (where ${redemptions.status} = 'issued' and ${redemptions.expiresAt} <= now())::int`,
        avgDaysToUse: sql<number>`coalesce(avg(extract(epoch from ${redemptions.redeemedAt} - ${redemptions.createdAt}) / 86400) filter (where ${redemptions.redeemedAt} is not null), 0)::float8`,
      })
      .from(redemptions)
      .where(issuedInRange),
    db
      .select({
        name: redemptions.rewardName,
        issued: sql<number>`count(*)::int`,
        used: sql<number>`count(*) filter (where ${redemptions.status} = 'redeemed')::int`,
      })
      .from(redemptions)
      .where(issuedInRange)
      .groupBy(redemptions.rewardName)
      .orderBy(sql`count(*) desc`)
      .limit(8),
    db
      .select({
        name: outlets.name,
        used: sql<number>`count(*)::int`,
      })
      .from(redemptions)
      .innerJoin(outlets, eq(redemptions.redeemedOutletId, outlets.id))
      .where(and(eq(redemptions.status, "redeemed"), issuedInRange))
      .groupBy(outlets.id, outlets.name)
      .orderBy(asc(outlets.id)),
  ]);

  const totals = totalRows[0] ?? {
    issued: 0,
    used: 0,
    activeUnused: 0,
    expiredUnused: 0,
    avgDaysToUse: 0,
  };
  return { ...totals, byVoucher, byOutlet };
}
