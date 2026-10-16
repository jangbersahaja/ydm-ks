"use client";

import { redeemVoucherTypeAction } from "@/app/actions/customer";
import { BottomSheet } from "@/components/bottom-sheet";
import { IconTile } from "@/components/brand/icon-tile";
import { ProgressBar } from "@/components/brand/progress-bar";
import { SheetHeader } from "@/components/brand/sheet-header";
import { ArrowIcon, CheckIcon, VoucherKindIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, iconButtonClass } from "@/components/ui";
import {
  VoucherDetails,
  type VoucherDetailsLabels,
} from "@/components/voucher-details";
import Link from "next/link";
import { useActionState, useState } from "react";

type RedeemLabels = {
  redeem: string;
  confirmTitle: string;
  confirm: string;
  cancel: string;
  close: string;
  viewVouchers: string;
  details: VoucherDetailsLabels;
};

export type RedeemCardProps = {
  voucherTypeId: number;
  name: string;
  kind: string;
  description: string;
  costText: string;
  canRedeem: boolean;
  progress: number;
  notEnoughText: string | null;
  confirmText: string;
  balanceAfterText: string;
  validity: string;
  minSpend: string;
  claim: string;
  terms: string | null;
  labels: RedeemLabels;
};

export function RedeemVoucherCard(props: RedeemCardProps) {
  const {
    voucherTypeId,
    name,
    kind,
    description,
    costText,
    canRedeem,
    progress,
    notEnoughText,
    confirmText,
    balanceAfterText,
    validity,
    minSpend,
    claim,
    terms,
    labels,
  } = props;
  const [open, setOpen] = useState(false);

  return (
    <li className="flex flex-col gap-4 py-5">
      <div className="flex items-center gap-4">
        <IconTile>
          <VoucherKindIcon kind={kind} className="h-5 w-5" />
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted">{description}</p>
          <p className="text-sm font-semibold text-roast">{costText}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!canRedeem}
          aria-label={labels.redeem}
          title={labels.redeem}
          className={iconButtonClass("primary")}
        >
          <ArrowIcon className="h-5 w-5" />
        </button>
      </div>

      {notEnoughText ? (
        <div className="space-y-2">
          <ProgressBar percent={progress} label={name} />
          <p className="text-xs font-medium tabular-nums text-muted">
            {notEnoughText}
          </p>
        </div>
      ) : null}

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <RedeemSheetBody
          voucherTypeId={voucherTypeId}
          name={name}
          kind={kind}
          description={description}
          confirmText={confirmText}
          balanceAfterText={balanceAfterText}
          validity={validity}
          minSpend={minSpend}
          claim={claim}
          terms={terms}
          labels={labels}
          onClose={() => setOpen(false)}
        />
      </BottomSheet>
    </li>
  );
}

type SheetProps = Omit<
  RedeemCardProps,
  "costText" | "canRedeem" | "progress" | "notEnoughText"
> & {
  onClose: () => void;
};

// Mounted only while open, so each opening starts with a fresh action state.
function RedeemSheetBody({
  voucherTypeId,
  name,
  kind,
  description,
  confirmText,
  balanceAfterText,
  validity,
  minSpend,
  claim,
  terms,
  labels,
  onClose,
}: SheetProps) {
  const [state, formAction] = useActionState(redeemVoucherTypeAction, {});

  if (state.ok) {
    return (
      <div className="space-y-6 p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckIcon className="h-7 w-7" />
        </span>
        <p className="font-semibold">{state.message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className={buttonClass("secondary")}
          >
            {labels.close}
          </button>
          <Link href="/rewards?tab=vouchers" className={buttonClass("primary")}>
            {labels.viewVouchers}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5 p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]"
    >
      <SheetHeader closeLabel={labels.close} onClose={onClose}>
        <p className="text-lg font-semibold">{labels.confirmTitle}</p>
      </SheetHeader>

      <div className="flex items-center gap-4 border-y border-espresso/10 py-4">
        <IconTile>
          <VoucherKindIcon kind={kind} className="h-5 w-5" />
        </IconTile>
        <div className="min-w-0">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>

      <VoucherDetails
        labels={labels.details}
        validity={validity}
        minSpend={minSpend}
        claim={claim}
        terms={terms}
      />

      <input type="hidden" name="voucherTypeId" value={voucherTypeId} />

      <div className="space-y-1 text-sm">
        <p>{confirmText}</p>
        <p className="font-semibold text-roast">{balanceAfterText}</p>
      </div>

      {state.message ? (
        <p role="alert" className="text-sm text-accent">
          {state.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className={buttonClass("secondary")}
        >
          {labels.cancel}
        </button>
        <SubmitButton className={buttonClass("primary")}>
          {labels.confirm}
        </SubmitButton>
      </div>
    </form>
  );
}
