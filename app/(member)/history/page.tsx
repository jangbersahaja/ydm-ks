import { EmptyState } from "@/components/brand/empty-state";
import { ListGroup, ListRow } from "@/components/brand/list-row";
import { SectionHeader } from "@/components/brand/section-header";
import { SegmentedControl } from "@/components/brand/segmented-control";
import { buttonSmClass } from "@/components/ui";
import { getLedger, getPurchases } from "@/lib/db/queries";
import { formatDateTime, formatRM } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { ledgerLabel } from "@/lib/labels";
import { requireCustomerId } from "@/lib/session";
import Link from "next/link";

export const instant = false;

const PAGE_SIZE = 10;

const parsePage = (value: string | undefined) => {
  const n = Math.floor(Number(value));
  return n > 1 ? n : 1;
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    purchases?: string;
    activity?: string;
  }>;
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
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        {t.history.title}
      </h1>

      <SegmentedControl
        items={[
          {
            href: `/history?tab=purchases&purchases=${purchasePages}&activity=${activityPages}`,
            label: t.history.purchases,
            active: activeTab === "purchases",
          },
          {
            href: `/history?tab=activity&purchases=${purchasePages}&activity=${activityPages}`,
            label: t.history.activity,
            active: activeTab === "activity",
          },
        ]}
      />

      {activeTab === "purchases" ? (
        <section className="space-y-2">
          <SectionHeader title={t.history.purchases} />
          {purchaseRows.length === 0 ? (
            <EmptyState>{t.history.empty}</EmptyState>
          ) : (
            <ListGroup>
              {purchaseRows.map((row) => (
                <ListRow
                  key={row.id}
                  trailing={
                    <p className="shrink-0 font-bold text-roast">
                      {t.history.earned(row.points)}
                    </p>
                  }
                >
                  <p className="font-semibold">{row.outletName}</p>
                  <p className="text-sm text-muted">
                    {t.history.amount}: {formatRM(row.amountCents)}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateTime(row.createdAt, locale)}
                  </p>
                </ListRow>
              ))}
            </ListGroup>
          )}
          {hasMorePurchases ? (
            <Link
              href={`/history?tab=purchases&purchases=${purchasePages + 1}&activity=${activityPages}`}
              scroll={false}
              className={`${buttonSmClass("secondary", "w-full")} mt-4`}
            >
              {t.history.showMore}
            </Link>
          ) : null}
        </section>
      ) : (
        <section className="space-y-2">
          <SectionHeader title={t.history.activity} />
          {ledger.length === 0 ? (
            <EmptyState>{t.history.empty}</EmptyState>
          ) : (
            <ListGroup>
              {ledger.map((row) => (
                <ListRow
                  key={row.id}
                  trailing={
                    <p className="shrink-0 font-bold">
                      {row.delta > 0 ? "+" : ""}
                      {row.delta}
                    </p>
                  }
                >
                  <p className="font-medium">{ledgerLabel(row.reason, t)}</p>
                  <p className="text-xs text-muted">
                    {formatDateTime(row.createdAt, locale)}
                  </p>
                </ListRow>
              ))}
            </ListGroup>
          )}
          {hasMoreActivity ? (
            <Link
              href={`/history?tab=activity&purchases=${purchasePages}&activity=${activityPages + 1}`}
              scroll={false}
              className={`${buttonSmClass("secondary", "w-full")} mt-4`}
            >
              {t.history.showMore}
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
