"use server";

import type { ActionState } from "@/lib/action-state";
import { verifyDemoOtp } from "@/lib/auth";
import { parseBirthday } from "@/lib/birthday";
import { db } from "@/lib/db";
import { getCustomerByPhone } from "@/lib/db/queries";
import { customers } from "@/lib/db/schema";
import { fail, text } from "@/lib/form";
import { getT } from "@/lib/i18n";
import { normalizeMyPhone } from "@/lib/phone";
import { clearCustomerSession, setCustomerSession } from "@/lib/session";
import { issueRegistrationVouchers } from "@/lib/vouchers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { t } = await getT();

  const phone = normalizeMyPhone(text(formData, "phone"));
  if (!phone) return fail(t.auth.errors.phone);

  const name = text(formData, "name").trim();
  if (name.length < 2) return fail(t.auth.errors.name);

  const email = text(formData, "email").trim().toLowerCase();
  if (!z.email().safeParse(email).success) return fail(t.auth.errors.email);

  const birthday = parseBirthday(text(formData, "birthday").trim());
  if (!birthday) return fail(t.auth.errors.birthday);

  if (!verifyDemoOtp(text(formData, "otp"))) return fail(t.auth.errors.code);

  if (await getCustomerByPhone(phone)) return fail(t.auth.errors.exists);

  const customerId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(customers)
      .values({ phone, name, email, birthday })
      .returning({ id: customers.id });
    await issueRegistrationVouchers(tx, created.id);
    return created.id;
  });

  await setCustomerSession(customerId);
  redirect("/dashboard");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { t } = await getT();

  const phone = normalizeMyPhone(text(formData, "phone"));
  if (!phone) return fail(t.auth.errors.phone);

  if (!verifyDemoOtp(text(formData, "otp"))) return fail(t.auth.errors.code);

  const customer = await getCustomerByPhone(phone);
  if (!customer) return fail(t.auth.errors.notFound);

  await setCustomerSession(customer.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearCustomerSession();
  redirect("/");
}
