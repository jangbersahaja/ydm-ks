"use client";

import { BottomSheet } from "@/components/bottom-sheet";
import { EmptyState } from "@/components/brand/empty-state";
import { IconTile } from "@/components/brand/icon-tile";
import { ListGroup, ListRow } from "@/components/brand/list-row";
import { SectionHeader } from "@/components/brand/section-header";
import { SheetHeader } from "@/components/brand/sheet-header";
import { QrCodeIcon, VoucherKindIcon } from "@/components/icons";
import { buttonSmClass, iconButtonClass } from "@/components/ui";
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

const PAST_PAGE_SIZE = 5;

export function VoucherList({ active, past, labels }: VoucherListProps) {
  const [selected, setSelected] = useState<ActiveVoucherView | null>(null);
  const [pastShown, setPastShown] = useState(PAST_PAGE_SIZE);

  if (active.length === 0 && past.length === 0) {
    return <EmptyState>{labels.emptyText}</EmptyState>;
  }

  return (
    <div className="space-y-8">
      {active.length > 0 ? (
        <section className="space-y-2">
          <SectionHeader title={labels.activeTitle} />
          <ListGroup>
            {active.map((voucher) => (
              <ListRow
                key={voucher.id}
                icon={
                  <IconTile>
                    <VoucherKindIcon kind={voucher.kind} className="h-5 w-5" />
                  </IconTile>
                }
                trailing={
                  <button
                    type="button"
                    onClick={() => setSelected(voucher)}
                    aria-label={labels.scanAtStore}
                    title={labels.scanAtStore}
                    className={iconButtonClass("primary")}
                  >
                    <QrCodeIcon className="h-5 w-5" />
                  </button>
                }
              >
                <p className="font-bold">{voucher.rewardName}</p>
                <p className="text-sm text-muted">{voucher.validity}</p>
              </ListRow>
            ))}
          </ListGroup>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={labels.pastTitle} />
          <ListGroup>
            {past.slice(0, pastShown).map((voucher) => (
              <ListRow
                key={voucher.id}
                icon={
                  <IconTile tone="muted">
                    <VoucherKindIcon kind={voucher.kind} className="h-5 w-5" />
                  </IconTile>
                }
              >
                <p className="font-semibold text-muted">{voucher.rewardName}</p>
                <p className="text-sm text-muted">{voucher.detail}</p>
              </ListRow>
            ))}
          </ListGroup>
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
            <SheetHeader
              closeLabel={labels.closeVoucher}
              onClose={() => setSelected(null)}
            >
              <p className="font-semibold">{selected.rewardName}</p>
              <p className="text-sm text-muted">{selected.description}</p>
            </SheetHeader>

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
