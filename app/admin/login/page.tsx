import { adminLoginAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { getT } from "@/lib/i18n";

export const instant = false;

export default async function AdminLoginPage() {
  const { t } = await getT();

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className={`${cardClass} w-full max-w-sm`}>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.adminLoginTitle}
        </h1>
        <p className="mt-1 text-sm text-espresso/70">
          {t.admin.adminLoginBody}
        </p>
        <ActionForm action={adminLoginAction} className="mt-6 space-y-4">
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
