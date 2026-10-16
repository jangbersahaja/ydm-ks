"use server";

import type { ActionState } from "@/lib/action-state";
import { verifyAdminPassword } from "@/lib/auth";
import { getSettings, saveSettings, saveStaffPassword } from "@/lib/config";
import {
  isPricedFreeItemKind,
  STAFF_OUTLETS,
  VOUCHER_KINDS,
  VOUCHER_TRIGGERS,
} from "@/lib/constants";
import { db } from "@/lib/db";
import {
  getBalance,
  getCupsVoucherType,
  getCustomerByLookup,
  getCustomerByMemberInput,
  getCustomerByVoucherCode,
  getOutletByCode,
  getOutletById,
} from "@/lib/db/queries";
import {
  customers,
  pointLedger,
  purchases,
  redemptions,
  taskDefinitions,
  voucherTypes,
} from "@/lib/db/schema";
import { fail, runAction, succeed, text } from "@/lib/form";
import { getT } from "@/lib/i18n";
import {
  clearAdminSession,
  getCounterAccess,
  requireAdmin,
  setAdminSession,
} from "@/lib/session";
import {
  issueVoucher,
  voucherDiscountCents,
  voucherProblem,
  type VoucherProblem,
} from "@/lib/vouchers";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function adminLoginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { t } = await getT();
  if (!verifyAdminPassword(text(formData, "password"))) {
    return fail(t.admin.wrongPassword);
  }
  await setAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

type Messages = Awaited<ReturnType<typeof getT>>["t"];

type VoucherLookup = {
  valid: boolean;
  message: string;
  kind: string | null;
  value: number;
};

function voucherProblemMessage(t: Messages, problem: VoucherProblem) {
  if (problem === "other_member") return t.admin.voucherOtherMember;
  if (problem === "used") return t.admin.voucherUsed;
  return t.admin.voucherExpired;
}

// Checks a voucher as soon as its code is entered, before the purchase is submitted.
// When a member is given, the voucher must belong to that member.
// Throws when there is no counter session, so the client shows the lookup failure.
export async function lookupVoucherAction(
  code: string,
  memberInput = "",
): Promise<VoucherLookup> {
  if (!(await getCounterAccess())) throw new Error("Counter session missing");
  const { t } = await getT();
  const notValid = (message: string): VoucherLookup => ({
    valid: false,
    message,
    kind: null,
    value: 0,
  });
  const [voucher] = await db
    .select({
      customerId: redemptions.customerId,
      kind: redemptions.kind,
      value: redemptions.value,
      status: redemptions.status,
      expiresAt: redemptions.expiresAt,
      rewardName: redemptions.rewardName,
    })
    .from(redemptions)
    .where(eq(redemptions.code, code.trim().toUpperCase()))
    .limit(1);
  if (!voucher) return notValid(t.admin.voucherNotFound);
  const member = memberInput.trim()
    ? await getCustomerByMemberInput(memberInput)
    : null;
  const problem = voucherProblem(voucher, member?.id ?? null, new Date());
  if (problem) return notValid(voucherProblemMessage(t, problem));
  return {
    valid: true,
    message: t.admin.voucherValid(voucher.rewardName),
    kind: voucher.kind,
    value: voucher.value,
  };
}

// Returns the name and member code so the counter can fill the member field.
// A voucher scan also returns voucherCode so the voucher field is filled.
export async function lookupMemberAction(input: string): Promise<{
  name: string;
  memberCode: string;
  voucherCode: string | null;
} | null> {
  if (!(await getCounterAccess())) throw new Error("Counter session missing");
  const query = input.trim();
  if (!query) return null;
  const member = await getCustomerByLookup(query);
  if (member)
    return {
      name: member.name,
      memberCode: member.memberCode,
      voucherCode: null,
    };
  const code = query.toUpperCase();
  const owner = await getCustomerByVoucherCode(code);
  return owner
    ? { name: owner.name, memberCode: owner.memberCode, voucherCode: code }
    : null;
}

const MAX_AMOUNT_CENTS = 100_000;
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

// Parses "12", "12.5" or "12.50" into cents. Rejects other forms such as "1e3".
function moneyToCents(invalid: string, tooHigh: string) {
  return z
    .string()
    .trim()
    .regex(MONEY_PATTERN, { error: invalid })
    .transform((value) => Math.round(Number(value) * 100))
    .pipe(
      z
        .number()
        .int()
        .min(1, { error: invalid })
        .max(MAX_AMOUNT_CENTS, { error: tooHigh }),
    );
}

function purchaseSchema(t: Messages) {
  return z.object({
    member: z.string().trim().min(1, { error: t.admin.memberNotFound }),
    amount: moneyToCents(t.admin.invalidAmount, t.admin.errors.amountMax),
    cups: z
      .string()
      .trim()
      .regex(/^\d{0,2}$/, { error: t.admin.invalidCups })
      .transform((value) => Number(value || "0"))
      .pipe(z.number().max(50, { error: t.admin.invalidCups })),
    voucher: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase()),
    drinkPrice: z.string().trim(),
    requestId: z
      .string()
      .regex(/^[0-9a-f]{32}$/, { error: t.admin.errors.unexpected }),
  });
}

export async function recordPurchaseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { t } = await getT();
  return runAction(t.admin.errors.unexpected, () => savePurchase(formData, t));
}

async function savePurchase(
  formData: FormData,
  t: Messages,
): Promise<ActionState> {
  const access = await getCounterAccess();
  if (!access)
    return { ...fail(t.admin.errors.sessionExpired), code: "session" };

  const parsed = purchaseSchema(t).safeParse({
    member: text(formData, "member"),
    amount: text(formData, "amount"),
    cups: text(formData, "cups"),
    voucher: text(formData, "voucher"),
    drinkPrice: text(formData, "drinkPrice"),
    requestId: text(formData, "requestId"),
  });
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? t.admin.errors.unexpected);
  const {
    member,
    amount: amountCents,
    cups,
    voucher: voucherCode,
    drinkPrice: drinkPriceInput,
    requestId,
  } = parsed.data;

  // Staff are locked to their own outlet, so the outlet is read from the session.
  const outletId = Number(text(formData, "outletId"));
  const outlet = access.outletCode
    ? await getOutletByCode(access.outletCode)
    : Number.isInteger(outletId)
      ? await getOutletById(outletId)
      : null;
  if (!outlet) return fail(t.admin.errors.outlet);

  // Staff can type a phone number or scan a member or voucher QR.
  const customer = await getCustomerByMemberInput(member);
  if (!customer) return fail(t.admin.memberNotFound);

  const { pointsPerRinggit, firstPurchaseBonusPoints } = await getSettings();
  const now = new Date();

  const cupsRule = await getCupsVoucherType();
  const cupsTarget = cupsRule?.triggerCount ?? 0;

  type PurchaseResult =
    | { error: string }
    | { duplicate: true }
    | {
        points: number;
        bonus: number;
        cupsProgress: number;
        freeDrinks: number;
      };
  const result: PurchaseResult = await db.transaction(async (tx) => {
    // Row lock so two quick submissions cannot double-award or double-issue.
    await tx.execute(
      sql`select id from customers where id = ${customer.id} for update`,
    );

    const [duplicate] = await tx
      .select({ id: purchases.id })
      .from(purchases)
      .where(eq(purchases.requestId, requestId))
      .limit(1);
    if (duplicate) return { duplicate: true as const };

    const [current] = await tx
      .select({ cupsProgress: customers.cupsProgress })
      .from(customers)
      .where(eq(customers.id, customer.id))
      .limit(1);

    const [earlier] = await tx
      .select({ id: purchases.id })
      .from(purchases)
      .where(
        and(
          eq(purchases.customerId, customer.id),
          eq(purchases.outletId, outlet.id),
        ),
      )
      .limit(1);
    const awardBonus = !earlier && firstPurchaseBonusPoints > 0;

    // Only whole ringgit earn points. RM5.90 earns 5 points at the rate of 1 per RM1.
    let discountCents = 0;
    let redemptionId: number | null = null;
    let drinkPriceCents = 0;
    // The free drink is one of the cups on the bill, so it is not counted.
    let cupsCounted = cups;
    if (voucherCode) {
      const [voucher] = await tx
        .select({
          id: redemptions.id,
          customerId: redemptions.customerId,
          kind: redemptions.kind,
          value: redemptions.value,
          status: redemptions.status,
          expiresAt: redemptions.expiresAt,
          minSpendCents: redemptions.minSpendCents,
        })
        .from(redemptions)
        .where(eq(redemptions.code, voucherCode))
        .limit(1)
        .for("update");
      if (!voucher) return { error: t.admin.voucherNotFound };
      const problem = voucherProblem(voucher, customer.id, now);
      if (problem) return { error: voucherProblemMessage(t, problem) };
      if (voucher.minSpendCents !== null && amountCents < voucher.minSpendCents)
        return {
          error: t.admin.errors.voucherMinSpend(
            (voucher.minSpendCents / 100).toFixed(2),
          ),
        };
      if (isPricedFreeItemKind(voucher.kind)) {
        const drink = moneyToCents(
          t.admin.errors.drinkPrice,
          t.admin.errors.drinkPrice,
        ).safeParse(drinkPriceInput);
        if (!drink.success) return { error: t.admin.errors.drinkPrice };
        drinkPriceCents = drink.data;
        cupsCounted = Math.max(0, cups - 1);
      }
      discountCents = voucherDiscountCents(
        voucher.kind,
        voucher.value,
        amountCents,
        drinkPriceCents,
      );
      if (discountCents <= 0)
        return { error: t.admin.errors.voucherNoDiscount };
      redemptionId = voucher.id;
    }
    const paidCents = amountCents - discountCents;
    const points = Math.floor(paidCents / 100) * pointsPerRinggit;

    await tx.insert(purchases).values({
      customerId: customer.id,
      outletId: outlet.id,
      amountCents,
      discountCents,
      redemptionId,
      points,
      cups: cupsCounted,
    });
    if (redemptionId !== null) {
      await tx
        .update(redemptions)
        .set({
          status: "redeemed",
          redeemedAt: now,
          redeemedOutletId: outlet.id,
        })
        .where(eq(redemptions.id, redemptionId));
    }
    if (points > 0) {
      await tx.insert(pointLedger).values({
        customerId: customer.id,
        delta: points,
        reason: "purchase",
      });
    }
    const bonus = awardBonus ? firstPurchaseBonusPoints : 0;
    if (awardBonus) {
      await tx.insert(pointLedger).values({
        customerId: customer.id,
        delta: bonus,
        reason: "bonus:first_purchase",
      });
    }

    let freeDrinks = 0;
    let cupsProgress = current?.cupsProgress ?? 0;
    if (cupsRule && cupsTarget > 0 && cupsCounted > 0) {
      const total = cupsProgress + cupsCounted;
      freeDrinks = Math.floor(total / cupsTarget);
      cupsProgress = total % cupsTarget;
      for (let i = 0; i < freeDrinks; i++) {
        await issueVoucher(tx, customer.id, cupsRule);
      }
      await tx
        .update(customers)
        .set({ cupsProgress })
        .where(eq(customers.id, customer.id));
    }

    return { points, bonus, cupsProgress, freeDrinks };
  });

  if ("error" in result) return fail(result.error);
  if ("duplicate" in result) return succeed(t.admin.errors.alreadyRecorded);
  revalidatePath("/", "layout");
  // The purchase is already committed, so a balance lookup failure must not report an error.
  const balance = await getBalance(customer.id).catch((error: unknown) => {
    console.error("Balance lookup failed after purchase", error);
    return null;
  });
  return succeed(
    t.admin.recorded({
      name: customer.name,
      balance,
      points: result.points,
      bonus: result.bonus,
      cupsProgress: result.cupsProgress,
      cupsTarget,
      freeDrinks: result.freeDrinks,
    }),
  );
}

const settingsSchema = z.object({
  pointsPerRinggit: z.coerce.number().int().min(0).max(100),
  firstPurchaseBonusPoints: z.coerce.number().int().min(0).max(100),
});

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { t } = await getT();

  const parsed = settingsSchema.safeParse({
    pointsPerRinggit: text(formData, "pointsPerRinggit"),
    firstPurchaseBonusPoints: text(formData, "firstPurchaseBonusPoints"),
  });
  if (!parsed.success) return fail(t.common.invalid);

  const defs = await db
    .select({ id: taskDefinitions.id })
    .from(taskDefinitions);
  const taskPoints = new Map<number, number>();
  for (const def of defs) {
    const points = Number(text(formData, `task_points_${def.id}`));
    if (!Number.isInteger(points) || points < 0) return fail(t.common.invalid);
    taskPoints.set(def.id, points);
  }

  // A blank staff password keeps the current one.
  const staffPasswords: [string, string][] = [];
  for (const outletCode of Object.values(STAFF_OUTLETS)) {
    const password = text(formData, `staff_password_${outletCode}`);
    if (!password) continue;
    if (password.length < 6 || password.length > 100)
      return fail(t.admin.staffPasswordInvalid);
    staffPasswords.push([outletCode, password]);
  }

  await saveSettings(parsed.data);
  for (const [id, points] of taskPoints) {
    await db
      .update(taskDefinitions)
      .set({ points })
      .where(eq(taskDefinitions.id, id));
  }
  for (const [outletCode, password] of staffPasswords) {
    await saveStaffPassword(outletCode, password);
  }
  return succeed(t.common.saved);
}

// Creates or edits a voucher type. Empty id means create.
export async function saveVoucherTypeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { t } = await getT();

  const idInput = text(formData, "id").trim();
  const isNew = idInput === "";
  const id = isNew ? 0 : Number(idInput);
  if (!isNew && (!Number.isInteger(id) || id <= 0))
    return fail(t.common.invalid);

  const name = text(formData, "name").trim();
  if (name.length < 2 || name.length > 60)
    return fail(t.admin.voucherNameInvalid);

  const kind = VOUCHER_KINDS.find((k) => k === text(formData, "kind"));
  if (!kind) return fail(t.common.invalid);
  const trigger = VOUCHER_TRIGGERS.find((k) => k === text(formData, "trigger"));
  if (!trigger) return fail(t.common.invalid);

  const valueInput = Number(text(formData, "value").trim() || "0");
  let value = 0;
  if (kind === "percent_off") {
    if (!Number.isInteger(valueInput) || valueInput < 1 || valueInput > 100)
      return fail(t.admin.voucherValueInvalid);
    value = valueInput;
  } else if (kind === "amount_off") {
    // Admin types RM, stored as cents.
    if (!Number.isFinite(valueInput) || valueInput <= 0 || valueInput > 1000)
      return fail(t.admin.voucherValueInvalid);
    value = Math.round(valueInput * 100);
  }

  let pointsCost: number | null = null;
  if (trigger === "points_redeem") {
    const cost = Number(text(formData, "pointsCost").trim());
    if (!Number.isInteger(cost) || cost < 1 || cost > 10000)
      return fail(t.admin.voucherPointsInvalid);
    pointsCost = cost;
  }

  let triggerCount: number | null = null;
  if (trigger === "cups") {
    const count = Number(text(formData, "triggerCount").trim());
    if (!Number.isInteger(count) || count < 1 || count > 200)
      return fail(t.admin.voucherCupsInvalid);
    triggerCount = count;
  }

  const validDaysInput = text(formData, "validDays").trim();
  let validDays: number | null = null;
  if (validDaysInput) {
    const days = Number(validDaysInput);
    if (!Number.isInteger(days) || days < 1 || days > 3650)
      return fail(t.admin.voucherDaysInvalid);
    validDays = days;
  }

  const minSpendInput = text(formData, "minSpend").trim();
  let minSpendCents: number | null = null;
  if (minSpendInput) {
    const minSpend = Number(minSpendInput);
    if (!Number.isFinite(minSpend) || minSpend <= 0 || minSpend > 1000)
      return fail(t.admin.voucherMinSpendInvalid);
    minSpendCents = Math.round(minSpend * 100);
  }

  const terms = text(formData, "terms").trim();
  if (terms.length > 1000) return fail(t.admin.voucherTermsTooLong);

  const active = text(formData, "active") === "on";

  // Only one active cups voucher, because it defines the cups threshold.
  if (trigger === "cups" && active) {
    const otherCups = await db
      .select({ id: voucherTypes.id })
      .from(voucherTypes)
      .where(
        and(eq(voucherTypes.trigger, "cups"), eq(voucherTypes.active, true)),
      );
    if (otherCups.some((row) => row.id !== id))
      return fail(t.admin.voucherCupsConflict);
  }

  const values = {
    name,
    kind,
    value,
    pointsCost,
    trigger,
    triggerCount,
    validDays,
    minSpendCents,
    terms: terms || null,
    active,
  };

  if (isNew) {
    const code = text(formData, "code").trim().toLowerCase();
    if (!/^[a-z0-9_]{3,40}$/.test(code))
      return fail(t.admin.voucherCodeInvalid);
    const [existing] = await db
      .select({ id: voucherTypes.id })
      .from(voucherTypes)
      .where(eq(voucherTypes.code, code))
      .limit(1);
    if (existing) return fail(t.admin.voucherCodeTaken);

    await db.insert(voucherTypes).values({ code, ...values, sortOrder: 100 });
    revalidatePath("/", "layout");
    revalidatePath("/admin/vouchers");
    return succeed(t.admin.voucherCreated);
  }

  const updated = await db
    .update(voucherTypes)
    .set(values)
    .where(eq(voucherTypes.id, id))
    .returning({ id: voucherTypes.id });
  if (updated.length === 0) return fail(t.admin.voucherNotFound);

  revalidatePath("/", "layout");
  revalidatePath("/admin/vouchers");
  return succeed(t.admin.voucherSaved);
}
