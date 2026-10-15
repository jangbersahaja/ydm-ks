"use client";

import { BottomSheet } from "@/components/bottom-sheet";
import { BarcodeIcon, CloseIcon, VoucherKindIcon } from "@/components/icons";
import {
  buttonSmClass,
  cardClass,
  iconButtonClass,
  sectionTitleClass,
} from "@/components/ui";
import { type ReactNode, useState } from "react";

export type ActiveVoucherView = {
  id: number;
  kind: string;
  rewardName: string;
  description: string;
  code: string;
  validity: string;
  issued: string;
  qr: ReactNode;
};

export type PastVoucherView = {
  id: number;
  kind: string;
  rewardName: string;
  detail: string;
};

type VoucherListProps = {
  active: ActiveVoucherView[];
  past: PastVoucherView[];
  labels: {
    activeTitle: string;
    pastTitle: string;
    emptyText: string;
    scanAtStore: string;
    closeVoucher: string;
    voucherCode: string;
    showMore: string;
  };
};

const iconTileClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full";

const PAST_PAGE_SIZE = 5;

export function VoucherList({ active, past, labels }: VoucherListProps) {
  const [selected, setSelected] = useState<ActiveVoucherView | null>(null);
  const [pastShown, setPastShown] = useState(PAST_PAGE_SIZE);

  if (active.length === 0 && past.length === 0) {
    return <p className="text-sm text-espresso/70">{labels.emptyText}</p>;
  }

  return (
    <div className="space-y-6">
      {active.length > 0 ? (
        <section className="space-y-3">
          <h2 className={sectionTitleClass}>{labels.activeTitle}</h2>
          <ul className="space-y-3">
            {active.map((voucher) => (
              <li
                key={voucher.id}
                className={`${cardClass} flex items-center gap-4`}
              >
                <span className={`${iconTileClass} bg-roast/10 text-roast`}>
                  <VoucherKindIcon kind={voucher.kind} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{voucher.rewardName}</p>
                  <p className="text-sm text-espresso/70">{voucher.validity}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(voucher)}
                  aria-label={labels.scanAtStore}
                  title={labels.scanAtStore}
                  className={iconButtonClass("primary")}
                >
                  <BarcodeIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="space-y-3">
          <h2 className={sectionTitleClass}>{labels.pastTitle}</h2>
          <ul className="space-y-3">
            {past.slice(0, pastShown).map((voucher) => (
              <li
                key={voucher.id}
                className={`${cardClass} flex items-center gap-4`}
              >
                <span
                  className={`${iconTileClass} bg-espresso/5 text-espresso/50`}
                >
                  <VoucherKindIcon kind={voucher.kind} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-espresso/70">
                    {voucher.rewardName}
                  </p>
                  <p className="text-sm text-espresso/55">{voucher.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          {past.length > pastShown ? (
            <button
              type="button"
              onClick={() => setPastShown((n) => n + PAST_PAGE_SIZE)}
              className={buttonSmClass("secondary", "w-full")}
            >
              {labels.showMore}
            </button>
          ) : null}
        </section>
      ) : null}

      <BottomSheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="flex flex-col items-center gap-5 p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center">
            <div className="flex w-full items-start justify-between gap-3">
              <div className="min-w-0 text-left">
                <p className="font-semibold">{selected.rewardName}</p>
                <p className="text-sm text-espresso/70">
                  {selected.description}
                </p>
              </div>
              <button
                type="button"
                aria-label={labels.closeVoucher}
                title={labels.closeVoucher}
                onClick={() => setSelected(null)}
                className={iconButtonClass("secondary")}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {selected.qr}

            <div className="w-full space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-espresso/55">
                {labels.voucherCode}
              </p>
              <p className="break-all font-mono text-2xl font-bold tracking-wider">
                {selected.code}
              </p>
            </div>

            <div className="space-y-1 text-sm text-espresso/70">
              <p>{selected.validity}</p>
              <p>{selected.issued}</p>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
