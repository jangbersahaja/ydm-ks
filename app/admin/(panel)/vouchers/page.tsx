import { saveVoucherTypeAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import {
  buttonClass,
  cardClass,
  inputClass,
  sectionTitleClass,
} from "@/components/ui";
import {
  VOUCHER_KINDS,
  VOUCHER_TRIGGERS,
  type VoucherTrigger,
} from "@/lib/constants";
import { getVoucherTypes } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { VoucherType } from "@/lib/vouchers";

export const instant = false;

// Amount vouchers are stored in cents, shown and edited in RM.
function displayValue(type: VoucherType) {
  if (type.kind === "amount_off") return (type.value / 100).toFixed(2);
  if (type.kind === "percent_off") return String(type.value);
  return "";
}

function VoucherFields({ type, t }: { type: VoucherType | null; t: Dict }) {
  return (
    <>
      <Field label={t.admin.fieldName}>
        <input
          name="name"
          type="text"
          maxLength={60}
          required
          defaultValue={type?.name ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label={t.admin.fieldKind}>
        <select
          name="kind"
          defaultValue={type?.kind ?? "percent_off"}
          className={inputClass}
        >
          {VOUCHER_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {t.admin.kinds[kind]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.admin.fieldValue}>
        <input
          name="value"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          defaultValue={type ? displayValue(type) : ""}
          className={inputClass}
        />
      </Field>
      <Field label={t.admin.fieldTrigger}>
        <select
          name="trigger"
          defaultValue={type?.trigger ?? "registration"}
          className={inputClass}
        >
          {VOUCHER_TRIGGERS.map((trigger) => (
            <option key={trigger} value={trigger}>
              {t.admin.triggers[trigger]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.admin.fieldPointsCost}>
        <input
          name="pointsCost"
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          step={1}
          defaultValue={type?.pointsCost ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label={t.admin.fieldTriggerCount}>
        <input
          name="triggerCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={200}
          step={1}
          defaultValue={type?.triggerCount ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label={t.admin.fieldValidDays}>
        <input
          name="validDays"
          type="number"
          inputMode="numeric"
          min={1}
          max={3650}
          step={1}
          defaultValue={type?.validDays ?? ""}
          className={inputClass}
        />
      </Field>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          name="active"
          type="checkbox"
          defaultChecked={type ? type.active : true}
          className="h-5 w-5 accent-roast"
        />
        {t.admin.fieldActive}
      </label>
    </>
  );
}

export default async function AdminVouchersPage() {
  const { t } = await getT();
  const types = await getVoucherTypes();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.vouchersTitle}
        </h1>
        <p className="mt-1 text-sm text-espresso/70">{t.admin.vouchersBody}</p>
      </div>

      {types.map((type) => (
        <section key={type.id} className={cardClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs text-espresso/55">{type.code}</p>
            <p className="text-xs font-medium text-roast">
              {t.admin.triggers[type.trigger as VoucherTrigger] ?? type.trigger}
            </p>
          </div>
          <ActionForm action={saveVoucherTypeAction} className="space-y-4">
            <input type="hidden" name="id" value={type.id} />
            <VoucherFields type={type} t={t} />
            <SubmitButton className={`${buttonClass("primary")} w-full`}>
              {t.admin.saveVoucher}
            </SubmitButton>
          </ActionForm>
        </section>
      ))}

      <section className={cardClass}>
        <h2 className={`${sectionTitleClass} mb-4`}>{t.admin.newVoucher}</h2>
        <ActionForm action={saveVoucherTypeAction} className="space-y-4">
          <Field label={t.admin.fieldCode}>
            <input
              name="code"
              type="text"
              autoComplete="off"
              pattern="[A-Za-z0-9_]{3,40}"
              required
              className={`${inputClass} font-mono`}
            />
          </Field>
          <VoucherFields type={null} t={t} />
          <SubmitButton className={`${buttonClass("primary")} w-full`}>
            {t.admin.createVoucher}
          </SubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
