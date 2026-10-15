import { buttonSmClass, cardClass, sectionTitleClass } from "@/components/ui";
import { getLedger, getPurchases } from "@/lib/db/queries";
import { formatDateTime, formatRM } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { ledgerLabel } from "@/lib/labels";
import { requireCustomerId } from "@/lib/session";
import Link from "next/link";

export const instant = false;

const PAGE_SIZE = 10;

const tabClass = (active: boolean) =>
  `flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
    active ? "bg-white text-roast shadow-sm" : "text-espresso/60"
  }`;

const parsePage = (value: string | undefined) => {
  const n = Math.floor(Number(value));
  return n > 1 ? n : 1;
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; purchases?: string; activity?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab === "activity" ? "activity" : "purchases";
  const purchasePages = parsePage(params.purchases);
  const activityPages = parsePage(params.activity);
  const customerId = await requireCustomerId();
  const { t, locale } = await getT();

  // Fetch one extra row per list to know whether "show more" is needed.
  const purchaseLimit = PAGE_SIZE * purchasePages;
  const activityLimit = PAGE_SIZE * activityPages;
  const [purchaseFetched, ledgerFetched] = await Promise.all([
    getPurchases(customerId, purchaseLimit + 1),
    getLedger(customerId, activityLimit + 1),
  ]);
  const hasMorePurchases = purchaseFetched.length > purchaseLimit;
  const hasMoreActivity = ledgerFetched.length > activityLimit;
  const purchaseRows = purchaseFetched.slice(0, purchaseLimit);
  const ledger = ledgerFetched.slice(0, activityLimit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t.history.title}</h1>

      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-espresso/5 p-1">
        <Link
          href={`/history?tab=purchases&purchases=${purchasePages}&activity=${activityPages}`}
          aria-current={activeTab === "purchases" ? "page" : undefined}
          className={tabClass(activeTab === "purchases")}
        >
          {t.history.purchases}
        </Link>
        <Link
          href={`/history?tab=activity&purchases=${purchasePages}&activity=${activityPages}`}
          aria-current={activeTab === "activity" ? "page" : undefined}
          className={tabClass(activeTab === "activity")}
        >
          {t.history.activity}
        </Link>
      </div>

      {activeTab === "purchases" ? (
        <section className="space-y-3">
          <h2 className={sectionTitleClass}>{t.history.purchases}</h2>
          {purchaseRows.length === 0 ? (
            <p className="text-sm text-espresso/70">{t.history.empty}</p>
          ) : (
            <ul className="space-y-3">
              {purchaseRows.map((row) => (
                <li key={row.id} className={`${cardClass} space-y-1`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{row.outletName}</p>
                    <p className="font-semibold text-roast">
                      {t.history.earned(row.points)}
                    </p>
                  </div>
                  <p className="text-sm text-espresso/70">
                    {t.history.amount}: {formatRM(row.amountCents)}
                  </p>
                  <p className="text-xs text-espresso/55">
                    {formatDateTime(row.createdAt, locale)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {hasMorePurchases ? (
            <Link
              href={`/history?tab=purchases&purchases=${purchasePages + 1}&activity=${activityPages}`}
              scroll={false}
              className={buttonSmClass("secondary", "w-full")}
            >
              {t.history.showMore}
            </Link>
          ) : null}
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className={sectionTitleClass}>{t.history.activity}</h2>
          {ledger.length === 0 ? (
            <p className="text-sm text-espresso/70">{t.history.empty}</p>
          ) : (
            <ul className="space-y-3">
              {ledger.map((row) => (
                <li
                  key={row.id}
                  className={`${cardClass} flex items-center justify-between gap-3 py-4`}
                >
                  <div>
                    <p className="font-medium">{ledgerLabel(row.reason, t)}</p>
                    <p className="text-xs text-espresso/55">
                      {formatDateTime(row.createdAt, locale)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {row.delta > 0 ? "+" : ""}
                    {row.delta}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {hasMoreActivity ? (
            <Link
              href={`/history?tab=activity&purchases=${purchasePages}&activity=${activityPages + 1}`}
              scroll={false}
              className={buttonSmClass("secondary", "w-full")}
            >
              {t.history.showMore}
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
