"use client";

import { lookupVoucherAction } from "@/app/actions/admin";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui";
import { useVoucherCode } from "@/components/voucher-code-context";
import { isPricedFreeItemKind } from "@/lib/constants";
import { useEffect, useState, type ReactNode } from "react";

type Props = {
  codeLabel: string;
  discountLabel: string;
  discountHint: string;
  incompleteLabel: string;
  lookupFailedLabel: string;
};

// The discount field is enabled only for free item vouchers and preset for cash vouchers.
export function VoucherDiscountFields({
  codeLabel,
  discountLabel,
  discountHint,
  incompleteLabel,
  lookupFailedLabel,
}: Props) {
  const {
    voucherCode: code,
    setVoucherCode,
    memberQuery,
    setVoucherBlocked,
  } = useVoucherCode();
  const [lookup, setLookup] = useState<{
    code: string;
    member: string;
    info: Awaited<ReturnType<typeof lookupVoucherAction>>;
  } | null>(null);
  const [price, setPrice] = useState("");
  const trimmed = code.trim();

  useEffect(() => {
    if (trimmed.length !== 8) return;
    let cancelled = false;
    void lookupVoucherAction(trimmed, memberQuery)
      .catch(() => ({
        valid: false,
        message: lookupFailedLabel,
        kind: null,
        value: 0,
      }))
      .then((info) => {
        if (!cancelled) setLookup({ code: trimmed, member: memberQuery, info });
      });
    return () => {
      cancelled = true;
    };
  }, [trimmed, memberQuery, lookupFailedLabel]);

  const info =
    lookup?.code === trimmed && lookup.member === memberQuery
      ? lookup.info
      : null;
  const blocked = trimmed !== "" && !info?.valid;
  useEffect(() => {
    setVoucherBlocked(blocked);
  }, [blocked, setVoucherBlocked]);

  // One status block: the lookup result, or a prompt while the code is incomplete.
  let status: ReactNode = null;
  if (info) {
    status = (
      <p
        className={`rounded-xl px-3 py-2 text-sm font-semibold ${
          info.valid ? "bg-roast/10 text-roast" : "bg-accent/10 text-accent"
        }`}
        role="status"
      >
        {info.message}
      </p>
    );
  } else if (trimmed !== "" && trimmed.length !== 8) {
    status = <p className="text-xs text-accent">{incompleteLabel}</p>;
  }

  const isFreeItem = !!info?.kind && isPricedFreeItemKind(info.kind);
  const isCash = info?.kind === "amount_off";
  const shown = isFreeItem
    ? price
    : isCash && info
      ? (info.value / 100).toFixed(2)
      : "";

  return (
    <>
      <Field label={codeLabel}>
        <input
          name="voucher"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          value={code}
          onChange={(event) => setVoucherCode(event.target.value)}
          className={inputClass}
        />
      </Field>
      {status}
      <Field label={discountLabel} hint={discountHint}>
        <input
          name="drinkPrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={shown}
          onChange={(e) => setPrice(e.target.value)}
          disabled={!isFreeItem}
          required={isFreeItem}
          className={inputClass}
        />
      </Field>
    </>
  );
}

// Keeps submit disabled while the entered voucher is unusable, so the error shows only once.
export function VoucherSubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { voucherBlocked } = useVoucherCode();
  return (
    <SubmitButton className={className} disabled={voucherBlocked}>
      {children}
    </SubmitButton>
  );
}
