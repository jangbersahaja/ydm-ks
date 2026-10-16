"use client";

import { saveVoucherTypeAction } from "@/app/actions/admin";
import { BottomSheet } from "@/components/bottom-sheet";
import { Field } from "@/components/field";
import {
  CheckIcon,
  CloseIcon,
  PencilIcon,
  PlusIcon,
  VoucherKindIcon,
} from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import {
  buttonClass,
  cardClass,
  iconButtonClass,
  inputClass,
} from "@/components/ui";
import {
  VOUCHER_KINDS,
  VOUCHER_TRIGGERS,
  type VoucherKind,
  type VoucherTrigger,
} from "@/lib/constants";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { VoucherType } from "@/lib/vouchers";
import { useActionState, useState } from "react";

export type VoucherManagerLabels = Pick<
  Dict["admin"],
  | "fieldCode"
  | "fieldName"
  | "fieldKind"
  | "fieldValue"
  | "fieldTrigger"
  | "fieldPointsCost"
  | "fieldTriggerCount"
  | "fieldValidDays"
  | "fieldActive"
  | "kinds"
  | "triggers"
  | "newVoucher"
  | "createVoucher"
  | "saveVoucher"
  | "editVoucher"
  | "editVoucherTitle"
  | "inactive"
  | "redeemedCount"
  | "usedCount"
  | "close"
>;

const iconTileClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-roast/10 text-roast";

const sheetPadding = "p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]";

function displayValue(type: VoucherType | null) {
  if (!type) return "";
  if (type.kind === "amount_off") return (type.value / 100).toFixed(2);
  if (type.kind === "percent_off") return String(type.value);
  return "";
}

export function VoucherTypeManager({
  types,
  usage,
  labels,
}: {
  types: VoucherType[];
  usage: Record<number, { redeemed: number; used: number }>;
  labels: VoucherManagerLabels;
}) {
  // null = closed, { type: null } = create, { type: row } = edit
  const [sheet, setSheet] = useState<{ type: VoucherType | null } | null>(null);

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setSheet({ type: null })}
          aria-label={labels.newVoucher}
          title={labels.newVoucher}
          className={iconButtonClass("primary")}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {types.map((type) => (
          <li
            key={type.id}
            className={`${cardClass} relative flex items-center gap-4`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-2.5 top-2.5 h-2.5 w-2.5 rounded-full ${
                type.active ? "bg-success" : "bg-espresso/30"
              }`}
            />
            <span className="sr-only">
              {type.active ? labels.fieldActive : labels.inactive}
            </span>
            <span className={iconTileClass}>
              <VoucherKindIcon kind={type.kind} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{type.name}</p>
              <p className="truncate font-mono text-xs text-espresso/55">
                {type.code}
              </p>
              <p className="truncate text-sm text-espresso/70">
                {labels.kinds[type.kind as VoucherKind] ?? type.kind}
                {" · "}
                {labels.triggers[type.trigger as VoucherTrigger] ??
                  type.trigger}
              </p>
              <p className="mt-1 text-xs font-medium text-espresso/60 tabular-nums">
                {labels.redeemedCount} {usage[type.id]?.redeemed ?? 0}
                {" · "}
                {labels.usedCount} {usage[type.id]?.used ?? 0}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSheet({ type })}
              aria-label={labels.editVoucher}
              title={labels.editVoucher}
              className={`${iconButtonClass("secondary")} shrink-0`}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <BottomSheet open={sheet !== null} onClose={() => setSheet(null)}>
        {sheet ? (
          <VoucherSheetForm
            type={sheet.type}
            labels={labels}
            onClose={() => setSheet(null)}
          />
        ) : null}
      </BottomSheet>
    </>
  );
}

function VoucherSheetForm({
  type,
  labels,
  onClose,
}: {
  type: VoucherType | null;
  labels: VoucherManagerLabels;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(saveVoucherTypeAction, {});

  if (state.ok) {
    return (
      <div className={`${sheetPadding} space-y-6 text-center`}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckIcon className="h-7 w-7" />
        </span>
        <p className="font-semibold">{state.message}</p>
        <button
          type="button"
          onClick={onClose}
          className={`${buttonClass("primary")} w-full`}
        >
          {labels.close}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className={`${sheetPadding} space-y-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold">
          {type ? labels.editVoucherTitle : labels.newVoucher}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          title={labels.close}
          className={iconButtonClass("secondary")}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      {type ? <input type="hidden" name="id" value={type.id} /> : null}

      {type ? null : (
        <Field label={labels.fieldCode}>
          <input
            name="code"
            type="text"
            autoComplete="off"
            pattern="[A-Za-z0-9_]{3,40}"
            required
            className={`${inputClass} font-mono`}
          />
        </Field>
      )}

      <VoucherFields type={type} labels={labels} />

      {state.message ? (
        <p role="alert" className="text-sm text-accent">
          {state.message}
        </p>
      ) : null}

      <SubmitButton className={`${buttonClass("primary")} w-full`}>
        {type ? labels.saveVoucher : labels.createVoucher}
      </SubmitButton>
    </form>
  );
}

function VoucherFields({
  type,
  labels,
}: {
  type: VoucherType | null;
  labels: VoucherManagerLabels;
}) {
  return (
    <>
      <Field label={labels.fieldName}>
        <input
          name="name"
          type="text"
          maxLength={60}
          required
          defaultValue={type?.name ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label={labels.fieldKind}>
        <select
          name="kind"
          defaultValue={type?.kind ?? "percent_off"}
          className={inputClass}
        >
          {VOUCHER_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {labels.kinds[kind]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={labels.fieldValue}>
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

      <Field label={labels.fieldTrigger}>
        <select
          name="trigger"
          defaultValue={type?.trigger ?? "registration"}
          className={inputClass}
        >
          {VOUCHER_TRIGGERS.map((trigger) => (
            <option key={trigger} value={trigger}>
              {labels.triggers[trigger]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={labels.fieldPointsCost}>
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

      <Field label={labels.fieldTriggerCount}>
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

      <Field label={labels.fieldValidDays}>
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
        {labels.fieldActive}
      </label>
    </>
  );
}
