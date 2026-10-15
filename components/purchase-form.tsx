"use client";

import { recordPurchaseAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { MemberLookupField } from "@/components/member-lookup-field";
import { buttonClass, inputClass } from "@/components/ui";
import { VoucherCodeProvider } from "@/components/voucher-code-context";
import {
  VoucherDiscountFields,
  VoucherSubmitButton,
} from "@/components/voucher-discount-fields";
import type { ActionState } from "@/lib/action-state";
import { newRequestId } from "@/lib/form";
import { useCallback, useRef, useState } from "react";

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
  code: string;
  drinkPrice: string;
  drinkPriceHint: string;
  voucherIncomplete: string;
  record: string;
};

type Props = {
  outlet: { id: number; name: string } | null;
  outlets: { id: number; name: string }[];
  loginPath: string;
  labels: PurchaseFormLabels;
};

export function PurchaseForm({ outlet, outlets, loginPath, labels }: Props) {
  // Kept across failed attempts so a retry cannot record the same purchase twice.
  const requestIdRef = useRef<string | null>(null);
  // Changing the key clears the member, voucher, and amount fields after a success.
  const [round, setRound] = useState(0);

  const submit = useCallback(async (state: ActionState, formData: FormData) => {
    requestIdRef.current ??= newRequestId();
    formData.set("requestId", requestIdRef.current);
    const result = await recordPurchaseAction(state, formData);
    if (result.ok) requestIdRef.current = null;
    return result;
  }, []);

  const handleSuccess = useCallback(() => {
    setRound((n) => n + 1);
  }, []);

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
        <Field label={labels.cups} hint={labels.cupsHint}>
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
        <VoucherDiscountFields
          codeLabel={labels.code}
          discountLabel={labels.drinkPrice}
          discountHint={labels.drinkPriceHint}
          incompleteLabel={labels.voucherIncomplete}
          lookupFailedLabel={labels.lookupFailed}
        />
        <VoucherSubmitButton className={`${buttonClass("primary")} w-full`}>
          {labels.record}
        </VoucherSubmitButton>
      </VoucherCodeProvider>
    </ActionForm>
  );
}
