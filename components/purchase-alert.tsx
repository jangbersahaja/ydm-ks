"use client";

import { BottomSheet } from "@/components/bottom-sheet";
import { buttonClass } from "@/components/ui";
import { formatRM } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POLL_MS = 5000;

export type PurchaseAlertLabels = {
  title: string;
  amountPaid: string;
  discount: string;
  pointsEarned: string;
  firstVisitBonus: string;
  freeDrinksEarned: string;
  balance: string;
  cupsProgress: string;
  done: string;
};

export type PurchaseAlertData = {
  id: number;
  amountCents: number;
  discountCents: number;
  points: number;
  bonus: number;
  freeDrinks: number;
  balance: number;
  cupsProgress: number;
  cupsTarget: number;
};

type PurchaseAlertProps = {
  initialPurchaseId: number | null;
  labels: PurchaseAlertLabels;
};

export function PurchaseAlert({
  initialPurchaseId,
  labels,
}: PurchaseAlertProps) {
  const router = useRouter();
  // Highest purchase id already seen. Starts at the latest purchase when the page loaded.
  const seenIdRef = useRef(initialPurchaseId ?? 0);
  const [alert, setAlert] = useState<PurchaseAlertData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/member/purchases/latest", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const { purchase } = (await res.json()) as {
          purchase: PurchaseAlertData | null;
        };
        if (cancelled || !purchase || purchase.id <= seenIdRef.current) return;
        setAlert((current) => current ?? purchase);
      } catch {
        // Retried on the next tick.
      }
    }

    const timer = setInterval(check, POLL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  function close() {
    if (!alert) return;
    seenIdRef.current = alert.id;
    setAlert(null);
    router.refresh();
  }

  return (
    <BottomSheet open={alert !== null} onClose={close} dismissible={false}>
      {alert ? (
        <div className="space-y-5 p-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <p className="text-lg font-semibold">{labels.title}</p>

          <dl className="space-y-2 rounded-2xl bg-cream p-4 text-sm">
            <Row
              label={labels.amountPaid}
              value={formatRM(alert.amountCents - alert.discountCents)}
            />
            {alert.discountCents > 0 ? (
              <Row
                label={labels.discount}
                value={`- ${formatRM(alert.discountCents)}`}
              />
            ) : null}
            <Row label={labels.pointsEarned} value={`+${alert.points}`} />
            {alert.bonus > 0 ? (
              <Row label={labels.firstVisitBonus} value={`+${alert.bonus}`} />
            ) : null}
            {alert.freeDrinks > 0 ? (
              <Row
                label={labels.freeDrinksEarned}
                value={String(alert.freeDrinks)}
              />
            ) : null}
            <Row label={labels.balance} value={String(alert.balance)} />
            {alert.cupsTarget > 0 ? (
              <Row
                label={labels.cupsProgress}
                value={`${alert.cupsProgress} / ${alert.cupsTarget}`}
              />
            ) : null}
          </dl>

          <button
            type="button"
            onClick={close}
            className={`${buttonClass("primary")} w-full`}
          >
            {labels.done}
          </button>
        </div>
      ) : null}
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-espresso/70">{label}</dt>
      <dd className="min-w-0 break-all text-right font-semibold tabular-nums">
        {value}
      </dd>
    </div>
  );
}
