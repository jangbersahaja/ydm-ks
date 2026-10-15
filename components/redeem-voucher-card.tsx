"use client";

import { redeemVoucherTypeAction } from "@/app/actions/customer";
import { BottomSheet } from "@/components/bottom-sheet";
import {
  ArrowIcon,
  CheckIcon,
  CloseIcon,
  VoucherKindIcon,
} from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, iconButtonClass } from "@/components/ui";
import Link from "next/link";
import { useActionState, useState } from "react";

type RedeemLabels = {
  redeem: string;
  confirmTitle: string;
  confirm: string;
  cancel: string;
  close: string;
  viewVouchers: string;
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
  labels: RedeemLabels;
};

const iconTileClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-roast/10 text-roast";

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
    labels,
  } = props;
  const [open, setOpen] = useState(false);

  return (
    <li className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex items-center gap-4">
        <span className={iconTileClass}>
          <VoucherKindIcon kind={kind} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-espresso/70">{description}</p>
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
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-espresso/10"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-roast"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-medium text-espresso/60 tabular-nums">
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
  labels,
  onClose,
}: SheetProps) {
  const [state, formAction] = useActionState(redeemVoucherTypeAction, {});

  if (state.ok) {
    return (
      <div className="space-y-6 p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold">{labels.confirmTitle}</p>
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

      <div className="flex items-center gap-4 rounded-2xl bg-cream p-4">
        <span className={iconTileClass}>
          <VoucherKindIcon kind={kind} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-espresso/70">{description}</p>
        </div>
      </div>

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
