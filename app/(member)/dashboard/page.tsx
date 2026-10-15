import { ArrowIcon } from "@/components/icons";
import { ProgressStamps } from "@/components/progress-stamps";
import { QrCode } from "@/components/qr-code";
import { cardClass, iconButtonClass, sectionTitleClass } from "@/components/ui";
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

const STAMP_LIMIT = 14;

export const instant = false;

export default async function DashboardPage() {
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
    <div className="space-y-6">
      <div>
        <p className="text-sm text-espresso/60">
          {t.dashboard.greeting(firstName)}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.dashboard.balance}
        </h1>
      </div>

      <section
        className={`${cardClass} flex flex-col items-center gap-4 text-center`}
      >
        <div>
          <p className="font-semibold">{t.dashboard.memberTitle}</p>
          <p className="text-sm text-espresso/65">{t.dashboard.memberHint}</p>
        </div>
        <QrCode value={customer.memberCode} size={280} />
        <p className="text-xs text-espresso/60">
          {t.dashboard.memberCode}:{" "}
          <span className="font-mono font-semibold tracking-widest">
            {customer.memberCode}
          </span>
        </p>
      </section>

      <section className={`${cardClass} space-y-5`}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-espresso/60">{t.dashboard.balance}</p>
            <p className="text-5xl font-bold tracking-tight tabular-nums text-roast">
              {balance}
            </p>
          </div>
          <p className="text-right text-xs text-espresso/60">
            {t.landing.pointsLine(settings.pointsPerRinggit)}
          </p>
        </div>

        {cupsTarget > 0 ? (
          <div className="space-y-3 border-t border-espresso/10 pt-5">
            <div className="flex items-end justify-between gap-3">
              <p className="font-semibold">{t.dashboard.cupsTitle}</p>
              <p className="text-sm text-espresso/60 tabular-nums">
                {t.dashboard.cupsProgress(cupsProgress, cupsTarget)}
              </p>
            </div>
            {cupsTarget <= STAMP_LIMIT ? (
              <ProgressStamps filled={cupsProgress} total={cupsTarget} />
            ) : (
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-espresso/10"
                role="progressbar"
                aria-valuenow={cupsPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-roast"
                  style={{ width: `${cupsPercent}%` }}
                />
              </div>
            )}
            <p className="text-sm font-medium">
              {t.dashboard.cupsToNext(cupsTarget - cupsProgress)}
            </p>
            <p className="text-xs text-espresso/55">{t.dashboard.cupsHint}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-espresso/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {readyCount > 0 ? (
            <p className="font-semibold text-roast">
              {t.dashboard.vouchersReady(readyCount)}
            </p>
          ) : (
            <span />
          )}
          <Link
            href="/rewards"
            aria-label={t.dashboard.viewRewards}
            title={t.dashboard.viewRewards}
            className={iconButtonClass("primary", "self-end sm:self-auto")}
          >
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>{t.dashboard.recent}</h2>
          <Link href="/tasks" className="text-sm font-semibold text-roast">
            {t.dashboard.earnMore}
          </Link>
        </div>

        {ledger.length === 0 ? (
          <p className="text-sm text-espresso/70">{t.dashboard.empty}</p>
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
                <p
                  className={`font-semibold ${row.delta >= 0 ? "text-emerald-700" : "text-espresso"}`}
                >
                  {row.delta > 0 ? "+" : ""}
                  {row.delta}
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className="pt-2 text-xs text-espresso/55">
          {t.dashboard.sharedNote}
        </p>
      </section>
    </div>
  );
}
