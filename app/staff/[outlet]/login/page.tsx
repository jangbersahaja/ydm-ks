import { staffLoginAction } from "@/app/actions/staff";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { STAFF_OUTLETS } from "@/lib/constants";
import { getOutletByCode } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import { getStaffOutletCode } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

export const instant = false;

export default async function StaffLoginPage({
  params,
}: {
  params: Promise<{ outlet: string }>;
}) {
  await connection();
  const { outlet: slug } = await params;
  const outletCode = STAFF_OUTLETS[slug];
  if (!outletCode) notFound();

  // Already signed in to this outlet.
  if ((await getStaffOutletCode()) === outletCode) redirect(`/staff/${slug}`);

  const [outlet, { t }] = await Promise.all([
    getOutletByCode(outletCode),
    getT(),
  ]);

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className={`${cardClass} w-full max-w-sm`}>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.loginTitle}
        </h1>
        {outlet ? (
          <p className="mt-1 text-sm font-semibold text-roast">{outlet.name}</p>
        ) : null}
        <p className="mt-1 text-sm text-espresso/70">{t.admin.loginBody}</p>
        <ActionForm action={staffLoginAction} className="mt-6 space-y-4">
          <input type="hidden" name="outlet" value={slug} />
          <Field label={t.admin.password}>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </Field>
          <SubmitButton className={`${buttonClass("primary")} w-full`}>
            {t.admin.login}
          </SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}
