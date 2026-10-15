import { logoutAction } from "@/app/actions/auth";
import { updateProfileAction } from "@/app/actions/customer";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { todayInKL } from "@/lib/birthday";
import { getCustomer } from "@/lib/db/queries";
import { formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
import { redirect } from "next/navigation";

export const instant = false;

export default async function ProfilePage() {
  const customerId = await requireCustomerId();
  const { t, locale } = await getT();
  const customer = await getCustomer(customerId);
  if (!customer) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t.profile.title}</h1>

      <section className={`${cardClass} space-y-4`}>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-espresso/60">{t.profile.phone}</dt>
            <dd className="font-semibold">{customer.phone}</dd>
          </div>
          <div>
            <dt className="text-espresso/60">{t.profile.memberSince}</dt>
            <dd className="font-semibold">
              {formatDate(customer.createdAt, locale)}
            </dd>
          </div>
          {customer.birthday ? (
            <div>
              <dt className="text-espresso/60">{t.auth.birthday}</dt>
              <dd className="font-semibold">
                {formatDate(
                  new Date(`${customer.birthday}T00:00:00+08:00`),
                  locale,
                )}
              </dd>
              <dd className="mt-1 text-xs text-espresso/55">
                {t.profile.birthdayLocked}
              </dd>
            </div>
          ) : null}
        </dl>

        <ActionForm
          action={updateProfileAction}
          className="space-y-4 border-t border-espresso/10 pt-4"
        >
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
      </section>

      <form action={logoutAction}>
        <SubmitButton className={`${buttonClass("secondary")} w-full`}>
          {t.profile.logout}
        </SubmitButton>
      </form>
    </div>
  );
}
