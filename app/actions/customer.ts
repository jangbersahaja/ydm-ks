"use server";

import type { ActionState } from "@/lib/action-state";
import { parseBirthday } from "@/lib/birthday";
import { db } from "@/lib/db";
import { getCustomer } from "@/lib/db/queries";
import {
  customers,
  outlets,
  pointLedger,
  taskClaims,
  taskDefinitions,
  voucherTypes,
} from "@/lib/db/schema";
import { fail, succeed, text } from "@/lib/form";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
import { issueVoucher } from "@/lib/vouchers";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const customerId = await requireCustomerId();
  const { t } = await getT();

  const name = text(formData, "name").trim();
  if (name.length < 2) return fail(t.auth.errors.name);

  const email = text(formData, "email").trim().toLowerCase();
  if (!z.email().safeParse(email).success) return fail(t.auth.errors.email);

  // Birthday can be set once. Once saved it is locked, so only an empty value is accepted.
  const values: { name: string; email: string; birthday?: string } = {
    name,
    email,
  };
  const current = await getCustomer(customerId);
  const birthdayInput = text(formData, "birthday").trim();
  if (current && !current.birthday && birthdayInput) {
    const birthday = parseBirthday(birthdayInput);
    if (!birthday) return fail(t.auth.errors.birthday);
    values.birthday = birthday;
  }

  await db.update(customers).set(values).where(eq(customers.id, customerId));
  revalidatePath("/", "layout");
  return succeed(t.profile.saved);
}

const taskIdSchema = z.number().int().positive();

// Awards the task on click. Each task can be earned once per account.
export async function claimTaskAction(taskId: number): Promise<ActionState> {
  const customerId = await requireCustomerId();
  const { t } = await getT();

  const parsed = taskIdSchema.safeParse(taskId);
  if (!parsed.success) return fail(t.common.invalid);

  const result = await db.transaction(async (tx) => {
    // Row lock so two taps cannot both award the same task.
    await tx.execute(
      sql`select id from customers where id = ${customerId} for update`,
    );

    const [def] = await tx
      .select({
        id: taskDefinitions.id,
        kind: taskDefinitions.kind,
        points: taskDefinitions.points,
        outletCode: outlets.code,
      })
      .from(taskDefinitions)
      .innerJoin(outlets, eq(taskDefinitions.outletId, outlets.id))
      .where(
        and(
          eq(taskDefinitions.id, parsed.data),
          eq(taskDefinitions.active, true),
        ),
      )
      .limit(1);
    if (!def) return { status: "missing" as const };

    const inserted = await tx
      .insert(taskClaims)
      .values({ customerId, taskId: def.id })
      .onConflictDoNothing()
      .returning({ id: taskClaims.id });
    if (inserted.length === 0) return { status: "done" as const };

    await tx.insert(pointLedger).values({
      customerId,
      delta: def.points,
      reason: `task:${def.kind}:${def.outletCode}`,
    });
    return { status: "awarded" as const, points: def.points };
  });

  revalidatePath("/", "layout");
  if (result.status === "missing") return fail(t.common.error);
  if (result.status === "done") return fail(t.tasks.alreadyDone);
  return succeed(t.tasks.earned(result.points));
}

// Spends points on a points_redeem voucher type chosen by the admin.
export async function redeemVoucherTypeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const customerId = await requireCustomerId();
  const { t } = await getT();

  const typeId = Number(text(formData, "voucherTypeId"));
  if (!Number.isInteger(typeId) || typeId <= 0) return fail(t.common.invalid);

  const result = await db.transaction(async (tx) => {
    // Row lock so two taps cannot both spend the same points.
    await tx.execute(
      sql`select id from customers where id = ${customerId} for update`,
    );

    const [type] = await tx
      .select()
      .from(voucherTypes)
      .where(
        and(
          eq(voucherTypes.id, typeId),
          eq(voucherTypes.active, true),
          eq(voucherTypes.trigger, "points_redeem"),
        ),
      )
      .limit(1);
    if (!type || type.pointsCost === null)
      return { status: "missing" as const };

    const [row] = await tx
      .select({
        total: sql<number>`coalesce(sum(${pointLedger.delta}), 0)::int`,
      })
      .from(pointLedger)
      .where(eq(pointLedger.customerId, customerId));
    const balance = Number(row?.total ?? 0);
    if (balance < type.pointsCost) {
      return {
        status: "short" as const,
        needed: type.pointsCost - balance,
      };
    }

    await issueVoucher(tx, customerId, type);
    await tx.insert(pointLedger).values({
      customerId,
      delta: -type.pointsCost,
      reason: `redeem:${type.code}`,
    });
    return { status: "ok" as const };
  });

  revalidatePath("/", "layout");
  if (result.status === "missing") return fail(t.common.error);
  if (result.status === "short")
    return fail(t.rewards.notEnough(result.needed));
  return succeed(t.rewards.created);
}
