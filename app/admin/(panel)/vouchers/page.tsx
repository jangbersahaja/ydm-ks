import {
  type VoucherManagerLabels,
  VoucherTypeManager,
} from "@/components/voucher-type-manager";
import { getVoucherTypes, getVoucherUsage } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";

export const instant = false;

export default async function AdminVouchersPage() {
  const { t } = await getT();
  const [types, usage] = await Promise.all([
    getVoucherTypes(),
    getVoucherUsage(),
  ]);

  // Pass plain strings only. The full dictionary contains functions and
  // cannot be sent to a client component.
  const labels: VoucherManagerLabels = {
    fieldCode: t.admin.fieldCode,
    fieldName: t.admin.fieldName,
    fieldKind: t.admin.fieldKind,
    fieldValue: t.admin.fieldValue,
    fieldTrigger: t.admin.fieldTrigger,
    fieldPointsCost: t.admin.fieldPointsCost,
    fieldTriggerCount: t.admin.fieldTriggerCount,
    fieldValidDays: t.admin.fieldValidDays,
    fieldMinSpend: t.admin.fieldMinSpend,
    fieldTerms: t.admin.fieldTerms,
    fieldActive: t.admin.fieldActive,
    kinds: t.admin.kinds,
    triggers: t.admin.triggers,
    newVoucher: t.admin.newVoucher,
    createVoucher: t.admin.createVoucher,
    saveVoucher: t.admin.saveVoucher,
    editVoucher: t.admin.editVoucher,
    editVoucherTitle: t.admin.editVoucherTitle,
    inactive: t.admin.inactive,
    redeemedCount: t.admin.redeemedCount,
    usedCount: t.admin.usedCount,
    close: t.admin.close,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.vouchersTitle}
        </h1>
        <p className="mt-1 text-sm text-espresso/70">{t.admin.vouchersBody}</p>
      </div>

      <VoucherTypeManager types={types} usage={usage} labels={labels} />
    </div>
  );
}
