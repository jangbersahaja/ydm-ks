import { loginAction } from "@/app/actions/auth";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { PublicShell } from "@/components/public-shell";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { getT } from "@/lib/i18n";
import Link from "next/link";

export const instant = false;

export default async function LoginPage() {
  const { t } = await getT();

  return (
    <PublicShell>
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t.auth.loginTitle}
        </h1>
        <p className="mt-2 text-espresso/70">{t.auth.loginBody}</p>

        <div className={`${cardClass} mt-6`}>
          <ActionForm action={loginAction} className="space-y-4">
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
              {t.auth.loginCta}
            </SubmitButton>
          </ActionForm>
        </div>

        <p className="mt-4 text-sm">
          <Link href="/register" className="font-semibold text-roast">
            {t.auth.newHere}
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
