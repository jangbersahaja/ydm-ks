import { recordPurchaseAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { QrScannerInput } from "@/components/qr-scanner";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { getOutlets } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";

export const instant = false;

export default async function AdminPurchasePage() {
  const { t } = await getT();
  const outletList = await getOutlets();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.purchaseTitle}
        </h1>
        <p className="mt-1 text-sm text-espresso/70">{t.admin.purchaseBody}</p>
      </div>

      <div className={cardClass}>
        <ActionForm action={recordPurchaseAction} className="space-y-4">
          <QrScannerInput
            name="member"
            label={t.admin.member}
            scanLabel={t.admin.scan}
            stopLabel={t.admin.stopScan}
            hint={t.admin.scanHint}
            errorLabel={t.admin.scanError}
            insecureLabel={t.admin.scanInsecure}
            placeholder={t.auth.phone}
          />
          <Field label={t.admin.outlet}>
            <select name="outletId" required className={inputClass}>
              {outletList.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.admin.amount}>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              className={inputClass}
            />
          </Field>
          <Field label={t.admin.cups} hint={t.admin.cupsHint}>
            <input
              name="cups"
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              step={1}
              defaultValue={0}
              required
              className={inputClass}
            />
          </Field>
          <SubmitButton className={`${buttonClass("primary")} w-full`}>
            {t.admin.record}
          </SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}
