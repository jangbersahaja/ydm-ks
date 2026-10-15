import { QrCode } from "@/components/qr-code";
import { RedeemVoucherCard } from "@/components/redeem-voucher-card";
import { cardClass, sectionTitleClass } from "@/components/ui";
import {
  type ActiveVoucherView,
  type PastVoucherView,
  VoucherList,
} from "@/components/voucher-list";
import {
  getBalance,
  getCustomer,
  getRedemptions,
  getVoucherTypes,
} from "@/lib/db/queries";
import { formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
import { ensureBirthdayVoucher } from "@/lib/vouchers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const instant = false;

const tabClass = (active: boolean) =>
  `flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
    active ? "bg-white text-roast shadow-sm" : "text-espresso/60"
  }`;

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "vouchers" ? "vouchers" : "points";
  const customerId = await requireCustomerId();
  const { t, locale } = await getT();

  const customer = await getCustomer(customerId);
  if (!customer) redirect("/login");

  await ensureBirthdayVoucher(customer.id, customer.birthday);

  const [balance, types, vouchers] = await Promise.all([
    getBalance(customerId),
    getVoucherTypes({ activeOnly: true }),
    getRedemptions(customerId),
  ]);

  const pointTypes = types.filter(
    (type) => type.trigger === "points_redeem" && type.pointsCost !== null,
  );

  const describe = (kind: string, value: number) => {
    if (kind === "percent_off") return t.rewards.percentOff(value);
    if (kind === "amount_off")
      return t.rewards.amountOff((value / 100).toFixed(2));
    if (kind === "buy_one_free_one") return t.rewards.buyOneFreeOne;
    return t.rewards.freeDrink;
  };

  const isActiveVoucher = (voucher: (typeof vouchers)[number]) =>
    voucher.status === "issued" && !voucher.isExpired;

  const activeVouchers: ActiveVoucherView[] = vouchers
    .filter(isActiveVoucher)
    .map((voucher) => ({
      id: voucher.id,
      kind: voucher.kind,
      rewardName: voucher.rewardName,
      description: describe(voucher.kind, voucher.value),
      code: voucher.code,
      validity: voucher.expiresAt
        ? t.rewards.expires(formatDate(voucher.expiresAt, locale))
        : t.rewards.noExpiry,
      issued: t.rewards.issuedOn(formatDate(voucher.createdAt, locale)),
      qr: <QrCode value={voucher.code} size={240} />,
    }));

  const pastVouchers: PastVoucherView[] = vouchers
    .filter((voucher) => !isActiveVoucher(voucher))
    .map((voucher) => ({
      id: voucher.id,
      kind: voucher.kind,
      rewardName: voucher.rewardName,
      detail:
        voucher.status === "redeemed"
          ? t.rewards.redeemedOn(
              formatDate(voucher.redeemedAt ?? voucher.createdAt, locale),
            )
          : t.rewards.expiredOn(
              formatDate(voucher.expiresAt ?? voucher.createdAt, locale),
            ),
    }));

  const voucherLabels = {
    activeTitle: t.rewards.activeTitle,
    pastTitle: t.rewards.pastTitle,
    emptyText: t.rewards.noVouchers,
    scanAtStore: t.rewards.scanAtStore,
    closeVoucher: t.rewards.closeVoucher,
    voucherCode: t.rewards.voucherCode,
    showMore: t.rewards.showMore,
  };

  const redeemLabels = {
    redeem: t.rewards.redeem,
    confirmTitle: t.rewards.confirmRedeemTitle,
    confirm: t.rewards.confirmRedeem,
    cancel: t.rewards.cancelRedeem,
    close: t.rewards.closeVoucher,
    viewVouchers: t.rewards.viewVouchers,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.rewards.title}</h1>
        <p className="mt-1 text-sm text-espresso/70">{t.rewards.body}</p>
      </div>

      <section className={`${cardClass}`}>
        <p className="text-sm text-espresso/60">{t.rewards.balance}</p>
        <p className="text-4xl font-bold tracking-tight tabular-nums text-roast">
          {balance}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-espresso/5 p-1">
        <Link
          href="/rewards?tab=points"
          aria-current={activeTab === "points" ? "page" : undefined}
          className={tabClass(activeTab === "points")}
        >
          {t.rewards.redeem}
        </Link>
        <Link
          href="/rewards?tab=vouchers"
          aria-current={activeTab === "vouchers" ? "page" : undefined}
          className={tabClass(activeTab === "vouchers")}
        >
          {t.rewards.vouchers}
          {activeVouchers.length > 0 ? (
            <span className="ml-2 rounded-full bg-roast px-2 py-0.5 text-xs text-white tabular-nums">
              {activeVouchers.length}
            </span>
          ) : null}
        </Link>
      </div>

      {activeTab === "points" ? (
        <section className="space-y-3">
          <h2 className={sectionTitleClass}>{t.rewards.pointsTitle}</h2>
          {pointTypes.length === 0 ? (
            <p className="text-sm text-espresso/70">{t.rewards.pointsEmpty}</p>
          ) : (
            <ul className="space-y-3">
              {pointTypes.map((type) => {
                const cost = type.pointsCost ?? 0;
                const canRedeem = balance >= cost;
                const progress =
                  cost > 0
                    ? Math.min(100, Math.round((balance / cost) * 100))
                    : 100;
                return (
                  <RedeemVoucherCard
                    key={type.id}
                    voucherTypeId={type.id}
                    name={type.name}
                    kind={type.kind}
                    description={describe(type.kind, type.value)}
                    costText={t.rewards.pointsCost(cost)}
                    canRedeem={canRedeem}
                    progress={progress}
                    notEnoughText={
                      canRedeem ? null : t.rewards.notEnough(cost - balance)
                    }
                    confirmText={t.rewards.confirmRedeemBody(cost)}
                    balanceAfterText={t.rewards.balanceAfter(balance - cost)}
                    labels={redeemLabels}
                  />
                );
              })}
            </ul>
          )}
        </section>
      ) : (
        <VoucherList
          active={activeVouchers}
          past={pastVouchers}
          labels={voucherLabels}
        />
      )}
    </div>
  );
}
