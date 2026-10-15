import { redeemVoucherAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { QrScannerInput } from "@/components/qr-scanner";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass } from "@/components/ui";
import { getT } from "@/lib/i18n";

export const instant = false;

export default async function AdminRedeemPage() {
  const { t } = await getT();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.redeemTitle}
        </h1>
        <p className="mt-1 text-sm text-espresso/70">{t.admin.redeemBody}</p>
      </div>

      <div className={cardClass}>
        <ActionForm action={redeemVoucherAction} className="space-y-4">
          <QrScannerInput
            name="code"
            label={t.admin.code}
            scanLabel={t.admin.scan}
            stopLabel={t.admin.stopScan}
            hint={t.admin.redeemScanHint}
            errorLabel={t.admin.scanError}
            insecureLabel={t.admin.scanInsecure}
          />
          <SubmitButton className={`${buttonClass("primary")} w-full`}>
            {t.admin.markRedeemed}
          </SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}
