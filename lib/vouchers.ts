import { todayInKL } from "@/lib/birthday";
import { isPricedFreeItemKind, type VoucherTrigger } from "@/lib/constants";
import { db } from "@/lib/db";
import { redemptions, voucherTypes } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export type VoucherType = typeof voucherTypes.$inferSelect;
type Executor = Pick<typeof db, "insert" | "select">;

const DAY_MS = 86_400_000;

export function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

// Free drinks are priced by staff at the counter and capped at the bill amount.
export function voucherDiscountCents(
  kind: string,
  value: number,
  amountCents: number,
  drinkPriceCents = 0,
) {
  if (kind === "percent_off") return Math.floor((amountCents * value) / 100);
  if (kind === "amount_off") return Math.min(value, amountCents);
  if (isPricedFreeItemKind(kind)) return Math.min(drinkPriceCents, amountCents);
  return 0;
}

export type VoucherState = {
  customerId: number;
  status: string;
  expiresAt: Date | null;
};

export type VoucherProblem = "other_member" | "used" | "expired";

// Checks a found voucher against the member it is used for. Null means it is usable.
export function voucherProblem(
  voucher: VoucherState,
  memberId: number | null,
  now: Date,
): VoucherProblem | null {
  if (memberId !== null && voucher.customerId !== memberId)
    return "other_member";
  if (voucher.status !== "issued") return "used";
  if (voucher.expiresAt && voucher.expiresAt <= now) return "expired";
  return null;
}

export function activeTypesByTrigger(exec: Executor, trigger: VoucherTrigger) {
  return exec
    .select()
    .from(voucherTypes)
    .where(
      and(eq(voucherTypes.trigger, trigger), eq(voucherTypes.active, true)),
    )
    .orderBy(asc(voucherTypes.sortOrder), asc(voucherTypes.id));
}

// Returns null when awardKey already issued the voucher.
export async function issueVoucher(
  exec: Executor,
  customerId: number,
  type: VoucherType,
  awardKey: string | null = null,
) {
  const [row] = await exec
    .insert(redemptions)
    .values({
      customerId,
      voucherTypeId: type.id,
      code: randomCode(),
      rewardName: type.name,
      kind: type.kind,
      value: type.value,
      costPoints: type.pointsCost ?? 0,
      awardKey,
      expiresAt: type.validDays
        ? new Date(Date.now() + type.validDays * DAY_MS)
        : null,
    })
    .onConflictDoNothing({ target: redemptions.awardKey })
    .returning({ id: redemptions.id });
  return row ?? null;
}

export async function issueRegistrationVouchers(
  exec: Executor,
  customerId: number,
) {
  for (const type of await activeTypesByTrigger(exec, "registration")) {
    await issueVoucher(
      exec,
      customerId,
      type,
      `registration:${customerId}:${type.id}`,
    );
  }
}

// Issues the birthday voucher once per year. Runs on page load (no scheduler).
export async function ensureBirthdayVoucher(
  customerId: number,
  birthday: string | null,
) {
  if (!birthday) return;
  const today = todayInKL();
  if (birthday.slice(5) !== today.slice(5)) return;
  const year = today.slice(0, 4);
  for (const type of await activeTypesByTrigger(db, "birthday")) {
    await issueVoucher(
      db,
      customerId,
      type,
      `birthday:${year}:${customerId}:${type.id}`,
    );
  }
}
