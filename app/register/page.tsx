import { registerAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/action-form";
import { Surface } from "@/components/brand/surface";
import { Field } from "@/components/field";
import { PublicShell } from "@/components/public-shell";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, inputClass } from "@/components/ui";
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
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t.auth.registerTitle}
        </h1>
        <p className="mt-2 text-muted">{t.auth.registerBody}</p>
        <p className="mt-2 text-sm font-bold text-roast">
          {t.auth.welcomePerk}
        </p>

        <Surface variant="panel" className="mt-6">
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
            <div className="flex items-start gap-3 text-sm text-espresso/80">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-roast"
              />
              <label htmlFor="acceptTerms" className="leading-6">
                {t.auth.consent.prefix}{" "}
                <Link href="/terms" className="font-semibold text-roast">
                  {t.footer.terms}
                </Link>{" "}
                {t.auth.consent.and}{" "}
                <Link href="/privacy" className="font-semibold text-roast">
                  {t.footer.privacy}
                </Link>
              </label>
            </div>
            <SubmitButton className={`${buttonClass("primary")} w-full`}>
              {t.auth.registerCta}
            </SubmitButton>
          </ActionForm>
        </Surface>

        <p className="mt-4 text-sm">
          <Link href="/login" className="font-semibold text-roast">
            {t.auth.haveAccount}
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
