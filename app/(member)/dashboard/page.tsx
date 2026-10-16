import { EmptyState } from "@/components/brand/empty-state";
import { ListGroup, ListRow } from "@/components/brand/list-row";
import { ProgressBar } from "@/components/brand/progress-bar";
import { SectionHeader } from "@/components/brand/section-header";
import { ArrowIcon } from "@/components/icons";
import { QrCode } from "@/components/qr-code";
import { iconButtonClass } from "@/components/ui";
import { getSettings } from "@/lib/config";
import {
  getBalance,
  getCupsVoucherType,
  getCustomer,
  getLedger,
  getRedemptions,
} from "@/lib/db/queries";
import { formatDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { ledgerLabel } from "@/lib/labels";
import { requireCustomerId } from "@/lib/session";
import { ensureBirthdayVoucher } from "@/lib/vouchers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const instant = false;

export default async function DashboardPage() {
  await connection();

  const customerId = await requireCustomerId();
  const { t, locale } = await getT();

  const customer = await getCustomer(customerId);
  if (!customer) redirect("/login");

  await ensureBirthdayVoucher(customer.id, customer.birthday);

  const [balance, settings, cupsRule, ledger, vouchers] = await Promise.all([
    getBalance(customerId),
    getSettings(),
    getCupsVoucherType(),
    getLedger(customerId, 5),
    getRedemptions(customerId),
  ]);

  const cupsTarget = cupsRule?.triggerCount ?? 0;
  const cupsProgress = Math.min(customer.cupsProgress, cupsTarget);
  const cupsPercent =
    cupsTarget > 0
      ? Math.min(100, Math.round((cupsProgress / cupsTarget) * 100))
      : 0;

  const readyCount = vouchers.filter(
    (v) => v.status === "issued" && !v.isExpired,
  ).length;

  const firstName = customer.name.trim().split(/\s+/)[0] ?? customer.name;

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-extrabold tracking-tight">
        {t.dashboard.greeting(firstName)}
      </h1>

      <section className="space-y-6 rounded-3xl bg-roast p-6 text-cream sm:p-8">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide">
              {t.dashboard.balance}
            </p>
            <p className="text-7xl font-extrabold leading-none tracking-tight tabular-nums">
              {balance}
            </p>
          </div>
          <p className="text-right text-xs">
            {t.landing.pointsLine(settings.pointsPerRinggit)}
          </p>
        </div>

        {cupsTarget > 0 ? (
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <p className="font-semibold">{t.dashboard.cupsTitle}</p>
              <p className="text-sm tabular-nums">
                {t.dashboard.cupsProgress(cupsProgress, cupsTarget)}
              </p>
            </div>
            <ProgressBar
              percent={cupsPercent}
              tone="cream"
              label={t.dashboard.cupsTitle}
            />
            <p className="text-sm font-semibold">
              {t.dashboard.cupsToNext(cupsTarget - cupsProgress)}
            </p>
            <p className="text-xs">{t.dashboard.cupsHint}</p>
          </div>
        ) : null}

        {readyCount > 0 ? (
          <Link
            href="/rewards"
            className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3.5 text-roast transition active:scale-[0.99]"
          >
            <span className="font-bold">
              {t.dashboard.vouchersReady(readyCount)}
            </span>
            <ArrowIcon className="h-5 w-5 shrink-0" />
          </Link>
        ) : (
          <div className="flex justify-end">
            <Link
              href="/rewards"
              aria-label={t.dashboard.viewRewards}
              title={t.dashboard.viewRewards}
              className={iconButtonClass("secondary")}
            >
              <ArrowIcon />
            </Link>
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-4 text-center">
        <div>
          <p className="font-bold">{t.dashboard.memberTitle}</p>
          <p className="text-sm text-muted">{t.dashboard.memberHint}</p>
        </div>
        <QrCode
          value={customer.memberCode}
          size={600}
          className="block h-auto w-full max-w-64 rounded-2xl bg-white p-3"
        />
        <p className="text-xs text-muted">
          {t.dashboard.memberCode}:{" "}
          <span className="font-mono font-semibold tracking-widest">
            {customer.memberCode}
          </span>
        </p>
      </section>

      <section className="space-y-2">
        <SectionHeader
          title={t.dashboard.recent}
          action={
            <Link href="/tasks" className="text-sm font-semibold text-roast">
              {t.dashboard.earnMore}
            </Link>
          }
        />

        {ledger.length === 0 ? (
          <EmptyState>{t.dashboard.empty}</EmptyState>
        ) : (
          <ListGroup>
            {ledger.map((row) => (
              <ListRow
                key={row.id}
                trailing={
                  <p
                    className={`shrink-0 font-bold ${row.delta >= 0 ? "text-success" : "text-espresso"}`}
                  >
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

        <p className="pt-2 text-xs text-muted">{t.dashboard.sharedNote}</p>
      </section>
    </div>
  );
}
