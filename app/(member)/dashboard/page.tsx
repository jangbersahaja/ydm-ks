import { ArrowIcon } from "@/components/icons";
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
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        {t.dashboard.greeting(firstName)}
      </h1>

      <section
        className={`${cardClass} flex flex-col items-center gap-4 text-center`}
      >
        <div>
          <p className="font-semibold">{t.dashboard.memberTitle}</p>
          <p className="text-sm text-espresso/65">{t.dashboard.memberHint}</p>
        </div>
        <QrCode
          value={customer.memberCode}
          size={600}
          className="block h-auto w-full rounded-xl bg-white p-2"
        />
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
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-espresso/10"
              role="progressbar"
              aria-valuenow={cupsPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-roast transition-[width] duration-500"
                style={{ width: `${cupsPercent}%` }}
              />
            </div>
            <p className="text-sm font-medium">
              {t.dashboard.cupsToNext(cupsTarget - cupsProgress)}
            </p>
            <p className="text-xs text-espresso/55">{t.dashboard.cupsHint}</p>
          </div>
        ) : null}

        <div className="border-t border-espresso/10 pt-5">
          {readyCount > 0 ? (
            <Link
              href="/rewards"
              className="flex items-center justify-between gap-3 rounded-2xl bg-roast px-4 py-3.5 text-cream shadow-md ring-4 ring-roast/20 transition active:scale-[0.99]"
            >
              <span className="font-semibold">
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
                className={iconButtonClass("primary")}
              >
                <ArrowIcon />
              </Link>
            </div>
          )}
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
