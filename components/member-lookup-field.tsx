"use client";

import { lookupMemberAction } from "@/app/actions/admin";
import { QrScannerInput } from "@/components/qr-scanner";
import { useVoucherCode } from "@/components/voucher-code-context";
import { normalizeMyPhone } from "@/lib/phone";
import { useCallback, useEffect, useState } from "react";

type Props = {
  label: string;
  placeholder: string;
  scanLabel: string;
  stopLabel: string;
  hint: string;
  errorLabel: string;
  insecureLabel: string;
  notFoundLabel: string;
  lookupFailedLabel: string;
};

// Member codes are 12 characters and voucher codes 8, so phones are checked by validity instead.
function shouldLookup(query: string) {
  return (
    query.length === 12 ||
    query.length === 8 ||
    normalizeMyPhone(query) !== null
  );
}

// Shows the member name as soon as a member code, phone, or voucher code is entered.
export function MemberLookupField({
  label,
  placeholder,
  scanLabel,
  stopLabel,
  hint,
  errorLabel,
  insecureLabel,
  notFoundLabel,
  lookupFailedLabel,
}: Props) {
  const [input, setInput] = useState("");
  const [match, setMatch] = useState<{
    query: string;
    name: string | null;
    failed?: boolean;
  } | null>(null);
  const { setVoucherCode, setMemberQuery } = useVoucherCode();
  const handleChange = useCallback(
    (next: string) => {
      setInput(next);
      const query = next.trim();
      setMemberQuery(shouldLookup(query) ? query : "");
    },
    [setMemberQuery],
  );

  useEffect(() => {
    const query = input.trim();
    if (!shouldLookup(query)) return;
    let cancelled = false;
    void lookupMemberAction(query).then(
      (found) => {
        if (cancelled) return;
        // A voucher scan fills the voucher field and swaps in the owner's member code.
        if (found?.voucherCode) {
          setVoucherCode(found.voucherCode);
          handleChange(found.memberCode);
          return;
        }
        setMatch({ query, name: found?.name ?? null });
      },
      () => {
        if (!cancelled) setMatch({ query, name: null, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [input, setVoucherCode, handleChange]);

  const query = input.trim();
  const current = query && match?.query === query ? match : null;

  return (
    <div className="space-y-1.5">
      <QrScannerInput
        name="member"
        label={label}
        placeholder={placeholder}
        scanLabel={scanLabel}
        stopLabel={stopLabel}
        hint={hint}
        errorLabel={errorLabel}
        insecureLabel={insecureLabel}
        value={input}
        onValueChange={handleChange}
      />
      {current ? (
        <p
          className={
            current.name
              ? "text-sm font-semibold text-roast"
              : "text-xs text-accent"
          }
        >
          {current.name ?? (current.failed ? lookupFailedLabel : notFoundLabel)}
        </p>
      ) : null}
    </div>
  );
}
