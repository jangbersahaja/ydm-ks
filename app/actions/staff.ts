"use server";

import type { ActionState } from "@/lib/action-state";
import { verifyStaffPassword } from "@/lib/config";
import { STAFF_OUTLETS } from "@/lib/constants";
import { fail, text } from "@/lib/form";
import { getT } from "@/lib/i18n";
import { clearStaffSession, setStaffSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function staffLoginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { t } = await getT();
  const slug = text(formData, "outlet");
  const outletCode = STAFF_OUTLETS[slug];
  if (!outletCode) return fail(t.common.invalid);

  if (!(await verifyStaffPassword(outletCode, text(formData, "password")))) {
    return fail(t.admin.wrongPassword);
  }
  await setStaffSession(outletCode);
  redirect(`/staff/${slug}`);
}

export async function staffLogoutAction(formData: FormData) {
  const slug = text(formData, "outlet");
  await clearStaffSession();
  redirect(STAFF_OUTLETS[slug] ? `/staff/${slug}/login` : "/");
}
