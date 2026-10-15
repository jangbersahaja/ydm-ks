import {
  BarList,
  ColumnChart,
  KpiCard,
  type ChartPoint,
} from "@/components/analytics";
import { cardClass, sectionTitleClass } from "@/components/ui";
import {
  DORMANT_DAYS,
  getMemberSummary,
  getPointsSummary,
  getSalesSummary,
  getVoucherSummary,
  parseRange,
  RANGES,
  type AnalyticsRange,
} from "@/lib/db/analytics";
import { formatRM } from "@/lib/format";
import { getT } from "@/lib/i18n";
import Link from "next/link";
import { connection } from "next/server";

export const instant = false;

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await connection();
  const { range: rawRange } = await searchParams;
  const range = parseRange(rawRange);
  const { t } = await getT();
  const a = t.admin.analytics;

  const [sales, members, points, vouchers] = await Promise.all([
    getSalesSummary(range),
    getMemberSummary(range),
    getPointsSummary(range),
    getVoucherSummary(range),
  ]);

  const rangeLabels: Record<AnalyticsRange, string> = {
    "7d": a.range7d,
    "30d": a.range30d,
    "90d": a.range90d,
    all: a.rangeAll,
  };

  const revenueSeries: ChartPoint[] = sales.series.map((row) => ({
    title: row.bucket,
    axis: range === "all" ? row.bucket : row.bucket.slice(5),
    value: row.paidCents,
    display: formatRM(row.paidCents),
  }));

  const hourSeries: ChartPoint[] = Array.from({ length: 24 }, (_, hour) => {
    const count = sales.byHour.find((row) => row.hour === hour)?.count ?? 0;
    return {
      title: `${hour}:00`,
      axis: hour % 3 === 0 ? String(hour) : "",
      value: count,
      display: String(count),
    };
  });

  const outletRows = sales.byOutlet.map((row) => ({
    label: row.name,
    value: row.paidCents,
    display: `${formatRM(row.paidCents)} · ${row.count}`,
  }));

  const voucherRows = vouchers.byVoucher.map((row) => ({
    label: row.name,
    value: row.issued,
    display: a.usedOf(row.used, row.issued),
  }));

  const usedOutletRows = vouchers.byOutlet.map((row) => ({
    label: row.name,
    value: row.used,
    display: String(row.used),
  }));

  const voucherUseRate =
    vouchers.issued > 0 ? vouchers.used / vouchers.issued : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-espresso">{a.title}</h1>
        <p className="text-sm text-espresso/70">{a.body}</p>
      </header>

      <nav aria-label={a.rangeLabel} className="flex flex-wrap gap-2">
        {RANGES.map((value) => {
          const active = value === range;
          return (
            <Link
              key={value}
              href={`/admin/analytics?range=${value}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition hover:opacity-90 ${
                active
                  ? "bg-roast text-cream"
                  : "bg-white text-espresso ring-1 ring-espresso/15"
              }`}
            >
              {rangeLabels[value]}
            </Link>
          );
        })}
      </nav>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>{a.sales}</h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label={a.paidRevenue} value={formatRM(sales.paidCents)} />
          <KpiCard label={a.purchases} value={String(sales.count)} />
          <KpiCard
            label={a.averageTicket}
            value={formatRM(sales.averageTicketCents)}
          />
          <KpiCard
            label={a.voucherDiscount}
            value={formatRM(sales.discountCents)}
          />
        </div>
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-espresso">
            {a.revenueByPeriod}
          </h3>
          <div className="mt-4">
            <ColumnChart points={revenueSeries} emptyLabel={a.noSales} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={cardClass}>
            <h3 className="mb-4 text-sm font-semibold text-espresso">
              {a.byOutlet}
            </h3>
            <BarList rows={outletRows} emptyLabel={a.noSales} />
          </div>
          <div className={cardClass}>
            <h3 className="mb-4 text-sm font-semibold text-espresso">
              {a.byHour}
            </h3>
            <ColumnChart points={hourSeries} emptyLabel={a.noSales} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>{a.members}</h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label={a.totalMembers} value={String(members.total)} />
          <KpiCard label={a.newMembers} value={String(members.signups)} />
          <KpiCard label={a.activeMembers} value={String(members.active)} />
          <KpiCard
            label={a.repeatRate}
            value={percent(members.repeatRate)}
            hint={a.repeatHint}
          />
          <KpiCard
            label={a.neverPurchased}
            value={String(members.neverPurchased)}
          />
          <KpiCard
            label={a.dormant}
            value={String(members.dormant)}
            hint={a.dormantHint(DORMANT_DAYS)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>{a.points}</h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            label={a.pointsFromPurchases}
            value={String(points.purchase)}
          />
          <KpiCard
            label={a.firstPurchaseBonus}
            value={String(points.firstPurchaseBonus)}
          />
          <KpiCard label={a.taskPoints} value={String(points.tasks)} />
          <KpiCard label={a.pointsRedeemed} value={String(points.redeemed)} />
          <KpiCard label={a.pointsAdjusted} value={String(points.adjusted)} />
          <KpiCard
            label={a.outstandingPoints}
            value={String(points.outstanding)}
            hint={a.outstandingHint}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>{a.vouchers}</h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label={a.vouchersIssued} value={String(vouchers.issued)} />
          <KpiCard
            label={a.vouchersUsed}
            value={String(vouchers.used)}
            hint={`${a.useRate}: ${percent(voucherUseRate)}`}
          />
          <KpiCard
            label={a.activeUnused}
            value={String(vouchers.activeUnused)}
          />
          <KpiCard
            label={a.expiredUnused}
            value={String(vouchers.expiredUnused)}
          />
          <KpiCard
            label={a.avgDaysToUse}
            value={vouchers.avgDaysToUse.toFixed(1)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={cardClass}>
            <h3 className="mb-4 text-sm font-semibold text-espresso">
              {a.byVoucher}
            </h3>
            <BarList rows={voucherRows} emptyLabel={a.noVouchers} />
          </div>
          <div className={cardClass}>
            <h3 className="mb-4 text-sm font-semibold text-espresso">
              {a.usedAtOutlet}
            </h3>
            <BarList rows={usedOutletRows} emptyLabel={a.noVouchers} />
          </div>
        </div>
      </section>
    </div>
  );
}
