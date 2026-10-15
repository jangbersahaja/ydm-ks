"use server";

import type { ActionState } from "@/lib/action-state";
import { verifyAdminPassword } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/config";
import { VOUCHER_KINDS, VOUCHER_TRIGGERS } from "@/lib/constants";
import { db } from "@/lib/db";
import {
  getBalance,
  getCupsVoucherType,
  getCustomerByLookup,
} from "@/lib/db/queries";
import {
  customers,
  outlets,
  pointLedger,
  purchases,
  redemptions,
  taskDefinitions,
  voucherTypes,
} from "@/lib/db/schema";
import { fail, succeed, text } from "@/lib/form";
import { getT } from "@/lib/i18n";
import {
  clearAdminSession,
  requireAdmin,
  setAdminSession,
} from "@/lib/session";
import { issueVoucher } from "@/lib/vouchers";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
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

export async function recordPurchaseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { t } = await getT();

  // Staff can type a phone number or scan the member QR (member code).
  const memberInput = text(formData, "member").trim();
  if (!memberInput) return fail(t.admin.customerNotFound);

  const outletId = Number(text(formData, "outletId"));
  const [outlet] = Number.isInteger(outletId)
    ? await db.select().from(outlets).where(eq(outlets.id, outletId)).limit(1)
    : [];
  if (!outlet) return fail(t.common.invalid);

  const amount = Number(text(formData, "amount"));
  if (!Number.isFinite(amount) || amount <= 0)
    return fail(t.admin.invalidAmount);
  const amountCents = Math.round(amount * 100);

  const cupsInput = text(formData, "cups").trim() || "0";
  const cups = Number(cupsInput);
  if (!Number.isInteger(cups) || cups < 0 || cups > 50)
    return fail(t.admin.invalidCups);

  const customer = await getCustomerByLookup(memberInput);
  if (!customer) return fail(t.admin.customerNotFound);

  const { pointsPerRinggit, firstPurchaseBonusPoints } = await getSettings();
  // Only whole ringgit earn points. RM5.90 earns 5 points at the rate of 1 per RM1.
  const points = Math.floor(amountCents / 100) * pointsPerRinggit;

  const cupsRule = await getCupsVoucherType();
  const cupsTarget = cupsRule?.triggerCount ?? 0;

  const result = await db.transaction(async (tx) => {
    // Row lock so two quick submissions cannot double-award or double-issue.
    await tx.execute(
      sql`select id from customers where id = ${customer.id} for update`,
    );

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

    await tx.insert(purchases).values({
      customerId: customer.id,
      outletId: outlet.id,
      amountCents,
      points,
      cups,
    });
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
    if (cupsRule && cupsTarget > 0 && cups > 0) {
      const total = cupsProgress + cups;
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

    return { points, bonus, cups, cupsProgress, freeDrinks };
  });

  const balance = await getBalance(customer.id);
  revalidatePath("/", "layout");
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

  await saveSettings(parsed.data);
  for (const [id, points] of taskPoints) {
    await db
      .update(taskDefinitions)
      .set({ points })
      .where(eq(taskDefinitions.id, id));
  }
  return succeed(t.common.saved);
}

export async function redeemVoucherAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { t } = await getT();

  const code = text(formData, "code").trim().toUpperCase();
  if (!code) return fail(t.common.invalid);

  const now = new Date();
  const [updated] = await db
    .update(redemptions)
    .set({ status: "redeemed", redeemedAt: now })
    .where(
      and(
        eq(redemptions.code, code),
        eq(redemptions.status, "issued"),
        or(isNull(redemptions.expiresAt), gt(redemptions.expiresAt, now)),
      ),
    )
    .returning({
      rewardName: redemptions.rewardName,
      customerId: redemptions.customerId,
    });

  if (!updated) {
    const [existing] = await db
      .select({ status: redemptions.status })
      .from(redemptions)
      .where(eq(redemptions.code, code))
      .limit(1);
    if (!existing) return fail(t.admin.voucherNotFound);
    // Still issued but not updated means the voucher is past its expiry.
    if (existing.status === "issued") return fail(t.admin.voucherExpired);
    return fail(t.admin.voucherUsed);
  }

  const [customer] = await db
    .select({ name: customers.name })
    .from(customers)
    .where(eq(customers.id, updated.customerId))
    .limit(1);

  revalidatePath("/", "layout");
  return succeed(
    t.admin.voucherRedeemed(updated.rewardName, customer?.name ?? ""),
  );
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
