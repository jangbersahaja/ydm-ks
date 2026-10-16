import { logoutAction } from "@/app/actions/auth";
import { updateProfileAction } from "@/app/actions/customer";
import { ActionForm } from "@/components/action-form";
import { Surface } from "@/components/brand/surface";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, inputClass } from "@/components/ui";
import { todayInKL } from "@/lib/birthday";
import { getCustomer } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export const instant = false;

export default async function ProfilePage() {
  const customerId = await requireCustomerId();
  const { t, locale } = await getT();
  const customer = await getCustomer(customerId);
  if (!customer) redirect("/login");

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        {t.profile.title}
      </h1>

      <section className="space-y-6">
        <dl className="divide-y divide-espresso/10 text-sm">
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-muted">{t.profile.phone}</dt>
            <dd className="font-semibold">{customer.phone}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-muted">{t.profile.memberSince}</dt>
            <dd className="font-semibold">
              {formatDate(customer.createdAt, locale)}
            </dd>
          </div>
          {customer.birthday ? (
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-muted">{t.auth.birthday}</dt>
              <dd className="text-right">
                <span className="block font-semibold">
                  {formatDate(
                    new Date(`${customer.birthday}T00:00:00+08:00`),
                    locale,
                  )}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {t.profile.birthdayLocked}
                </span>
              </dd>
            </div>
          ) : null}
        </dl>

        <Surface variant="panel">
          <ActionForm action={updateProfileAction} className="space-y-4">
            <Field label={t.profile.name}>
              <input
                name="name"
                type="text"
                defaultValue={customer.name}
                required
                className={inputClass}
              />
            </Field>
            <Field label={t.profile.email}>
              <input
                name="email"
                type="email"
                defaultValue={customer.email}
                required
                className={inputClass}
              />
            </Field>
            {!customer.birthday ? (
              <Field label={t.auth.birthday} hint={t.auth.birthdayHint}>
                <input
                  name="birthday"
                  type="date"
                  max={todayInKL()}
                  className={inputClass}
                />
              </Field>
            ) : null}
            <SubmitButton className={`${buttonClass("primary")} w-full`}>
              {t.profile.save}
            </SubmitButton>
          </ActionForm>
        </Surface>
      </section>

      <form action={logoutAction}>
        <SubmitButton className={`${buttonClass("secondary")} w-full`}>
          {t.profile.logout}
        </SubmitButton>
      </form>

      <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-roast">
        <Link href="/faq">{t.footer.faq}</Link>
        <Link href="/terms">{t.footer.terms}</Link>
        <Link href="/privacy">{t.footer.privacy}</Link>
      </nav>
    </div>
  );
}
