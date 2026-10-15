import { registerAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { PublicShell } from "@/components/public-shell";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { todayInKL } from "@/lib/birthday";
import { getT } from "@/lib/i18n";
import Link from "next/link";
import { connection } from "next/server";

export const instant = false;

export default async function RegisterPage() {
  await connection();
  const { t } = await getT();

  return (
    <PublicShell>
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t.auth.registerTitle}
        </h1>
        <p className="mt-2 text-espresso/70">{t.auth.registerBody}</p>
        <p className="mt-2 text-sm font-semibold text-roast">
          {t.auth.welcomePerk}
        </p>

        <div className={`${cardClass} mt-6`}>
          <ActionForm action={registerAction} className="space-y-4">
            <Field label={t.auth.phone} hint={t.auth.phoneHint}>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                className={inputClass}
              />
            </Field>
            <Field label={t.auth.name}>
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                className={inputClass}
              />
            </Field>
            <Field label={t.auth.email}>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </Field>
            <Field label={t.auth.birthday} hint={t.auth.birthdayHint}>
              <input
                name="birthday"
                type="date"
                max={todayInKL()}
                required
                className={inputClass}
              />
            </Field>
            <Field label={t.auth.code} hint={t.auth.codeHint}>
              <input
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                className={inputClass}
              />
            </Field>
            <SubmitButton className={`${buttonClass("primary")} w-full`}>
              {t.auth.registerCta}
            </SubmitButton>
          </ActionForm>
        </div>

        <p className="mt-4 text-sm">
          <Link href="/login" className="font-semibold text-roast">
            {t.auth.haveAccount}
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
