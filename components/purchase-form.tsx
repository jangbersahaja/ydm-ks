"use client";

import { recordPurchaseAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { BottomSheet } from "@/components/bottom-sheet";
import { Field } from "@/components/field";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { MemberLookupField } from "@/components/member-lookup-field";
import { SubmitButton } from "@/components/submit-button";
import {
  buttonClass,
  iconButtonClass,
  inputClass,
  labelClass,
} from "@/components/ui";
import {
  VoucherCodeProvider,
  useVoucherCode,
} from "@/components/voucher-code-context";
import { VoucherDiscountFields } from "@/components/voucher-discount-fields";
import type { ActionState } from "@/lib/action-state";
import { newRequestId } from "@/lib/form";
import { formatRM } from "@/lib/format";
import { useCallback, useId, useRef, useState } from "react";

export type PurchaseFormLabels = {
  member: string;
  placeholder: string;
  scanLabel: string;
  stopLabel: string;
  scanHint: string;
  scanError: string;
  scanInsecure: string;
  memberNotFound: string;
  lookupFailed: string;
  outlet: string;
  amount: string;
  cups: string;
  cupsHint: string;
  cupsDecrease: string;
  cupsIncrease: string;
  code: string;
  drinkPrice: string;
  drinkPriceHint: string;
  voucherIncomplete: string;
  record: string;
  confirmTitle: string;
  confirm: string;
  cancel: string;
  close: string;
};

type Props = {
  outlet: { id: number; name: string } | null;
  outlets: { id: number; name: string }[];
  loginPath: string;
  labels: PurchaseFormLabels;
};

type SummaryRow = { label: string; value: string };

// Reads the disabled discount field too, since cash vouchers fill it automatically.
function readSummary(
  form: HTMLFormElement,
  labels: PurchaseFormLabels,
  outletFallback: string,
): SummaryRow[] {
  const field = (name: string) =>
    (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() ??
    "";
  const outletField = form.elements.namedItem("outletId");
  const outletName =
    outletField instanceof HTMLSelectElement
      ? (outletField.selectedOptions[0]?.text ?? "")
      : outletFallback;
  const ringgit = (value: string) => formatRM(Math.round(Number(value) * 100));
  const code = field("voucher");
  return [
    { label: labels.member, value: field("member") },
    { label: labels.outlet, value: outletName },
    { label: labels.amount, value: ringgit(field("amount")) },
    { label: labels.cups, value: field("cups") },
    ...(code
      ? [
          { label: labels.code, value: code },
          { label: labels.drinkPrice, value: ringgit(field("drinkPrice")) },
        ]
      : []),
  ];
}

function ReviewButton({
  label,
  onReview,
}: {
  label: string;
  onReview: (form: HTMLFormElement) => void;
}) {
  const { voucherBlocked } = useVoucherCode();
  return (
    <button
      type="button"
      disabled={voucherBlocked}
      onClick={(event) => {
        const form = event.currentTarget.form;
        if (form) onReview(form);
      }}
      className={`${buttonClass("primary")} w-full`}
    >
      {label}
    </button>
  );
}

const MAX_CUPS = 50;

// Typing still works. Remounts with the form round, so it resets to 1 after each success.
function CupsStepper({
  label,
  hint,
  decreaseLabel,
  increaseLabel,
}: {
  label: string;
  hint: string;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const id = useId();
  const [raw, setRaw] = useState("1");
  const current = Math.min(MAX_CUPS, Math.max(0, Math.round(Number(raw) || 0)));
  const step = (delta: number) =>
    setRaw(String(Math.min(MAX_CUPS, Math.max(0, current + delta))));

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={decreaseLabel}
          title={decreaseLabel}
          disabled={current <= 0}
          onClick={() => step(-1)}
          className={iconButtonClass("secondary")}
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <input
          id={id}
          name="cups"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_CUPS}
          step={1}
          required
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          onFocus={(event) => event.target.select()}
          onBlur={() => setRaw(String(current))}
          className={`${inputClass} text-center font-semibold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />
        <button
          type="button"
          aria-label={increaseLabel}
          title={increaseLabel}
          disabled={current >= MAX_CUPS}
          onClick={() => step(1)}
          className={iconButtonClass("primary")}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      {hint ? (
        <span className="mt-1 block text-xs text-espresso/55">{hint}</span>
      ) : null}
    </div>
  );
}

export function PurchaseForm({ outlet, outlets, loginPath, labels }: Props) {
  // Kept across failed attempts so a retry cannot record the same purchase twice.
  const requestIdRef = useRef<string | null>(null);
  // Changing the key clears the member, voucher, and amount fields after a success.
  const [round, setRound] = useState(0);
  // Rows shown in the confirmation sheet; null while it is closed.
  const [summary, setSummary] = useState<SummaryRow[] | null>(null);

  const submit = useCallback(async (state: ActionState, formData: FormData) => {
    requestIdRef.current ??= newRequestId();
    formData.set("requestId", requestIdRef.current);
    const result = await recordPurchaseAction(state, formData);
    if (result.ok) requestIdRef.current = null;
    // Closes the sheet either way so the result message shows in the form.
    setSummary(null);
    return result;
  }, []);

  const handleSuccess = useCallback(() => {
    setRound((n) => n + 1);
  }, []);

  const review = (form: HTMLFormElement) => {
    if (!form.reportValidity()) return;
    setSummary(readSummary(form, labels, outlet?.name ?? ""));
  };

  return (
    <ActionForm
      action={submit}
      onSuccess={handleSuccess}
      loginPath={loginPath}
      className="space-y-4"
    >
      <VoucherCodeProvider key={round}>
        <MemberLookupField
          label={labels.member}
          placeholder={labels.placeholder}
          scanLabel={labels.scanLabel}
          stopLabel={labels.stopLabel}
          hint={labels.scanHint}
          errorLabel={labels.scanError}
          insecureLabel={labels.scanInsecure}
          notFoundLabel={labels.memberNotFound}
          lookupFailedLabel={labels.lookupFailed}
        />
        {outlet ? (
          <Field label={labels.outlet}>
            <input type="hidden" name="outletId" value={outlet.id} />
            <p className="flex min-h-11 items-center text-sm font-semibold">
              {outlet.name}
            </p>
          </Field>
        ) : (
          <Field label={labels.outlet}>
            <select name="outletId" required className={inputClass}>
              {outlets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label={labels.amount}>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max="1000"
            required
            className={inputClass}
          />
        </Field>
        <CupsStepper
          label={labels.cups}
          hint={labels.cupsHint}
          decreaseLabel={labels.cupsDecrease}
          increaseLabel={labels.cupsIncrease}
        />
        <VoucherDiscountFields
          codeLabel={labels.code}
          discountLabel={labels.drinkPrice}
          discountHint={labels.drinkPriceHint}
          incompleteLabel={labels.voucherIncomplete}
          lookupFailedLabel={labels.lookupFailed}
        />
        <ReviewButton label={labels.record} onReview={review} />
        <BottomSheet open={summary !== null} onClose={() => setSummary(null)}>
          {summary ? (
            <div className="space-y-5 p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-semibold">{labels.confirmTitle}</p>
                <button
                  type="button"
                  onClick={() => setSummary(null)}
                  aria-label={labels.close}
                  title={labels.close}
                  className={iconButtonClass("secondary")}
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <dl className="space-y-2 rounded-2xl bg-cream p-4 text-sm">
                {summary.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4">
                    <dt className="text-espresso/70">{row.label}</dt>
                    <dd className="min-w-0 break-all text-right font-semibold tabular-nums">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSummary(null)}
                  className={buttonClass("secondary")}
                >
                  {labels.cancel}
                </button>
                <SubmitButton className={buttonClass("primary")}>
                  {labels.confirm}
                </SubmitButton>
              </div>
            </div>
          ) : null}
        </BottomSheet>
      </VoucherCodeProvider>
    </ActionForm>
  );
}
