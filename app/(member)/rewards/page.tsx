import { redeemVoucherTypeAction } from "@/app/actions/customer";
import { ActionForm } from "@/components/action-form";
import { QrCode } from "@/components/qr-code";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, cardClass, sectionTitleClass } from "@/components/ui";
import {
  getBalance,
  getCustomer,
  getRedemptions,
  getVoucherTypes,
} from "@/lib/db/queries";
import { formatDate, formatDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
import { ensureBirthdayVoucher } from "@/lib/vouchers";
import { redirect } from "next/navigation";

export const instant = false;

export default async function RewardsPage() {
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
    return t.rewards.freeDrink;
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

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>{t.rewards.pointsTitle}</h2>
        {pointTypes.length === 0 ? (
          <p className="text-sm text-espresso/70">{t.rewards.pointsEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {pointTypes.map((type) => {
              const cost = type.pointsCost ?? 0;
              const canRedeem = balance >= cost;
              return (
                <li key={type.id} className={`${cardClass} space-y-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{type.name}</p>
                      <p className="text-sm text-espresso/70">
                        {describe(type.kind, type.value)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-roast">
                      {t.rewards.pointsCost(cost)}
                    </p>
                  </div>
                  <ActionForm action={redeemVoucherTypeAction}>
                    <input type="hidden" name="voucherTypeId" value={type.id} />
                    <SubmitButton
                      disabled={!canRedeem}
                      className={`${buttonClass("primary")} w-full`}
                    >
                      {canRedeem
                        ? t.rewards.redeem
                        : t.rewards.notEnough(cost - balance)}
                    </SubmitButton>
                  </ActionForm>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>{t.rewards.vouchers}</h2>
        {vouchers.length === 0 ? (
          <p className="text-sm text-espresso/70">{t.rewards.noVouchers}</p>
        ) : (
          <ul className="space-y-3">
            {vouchers.map((voucher) => {
              const isRedeemed = voucher.status === "redeemed";
              const isExpired = !isRedeemed && voucher.isExpired;
              const isReady = !isRedeemed && !isExpired;
              const statusLabel = isRedeemed
                ? t.rewards.redeemed
                : isExpired
                  ? t.rewards.expired
                  : t.rewards.issued;

              return (
                <li
                  key={voucher.id}
                  className={`${cardClass} flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left`}
                >
                  {isReady ? <QrCode value={voucher.code} size={112} /> : null}
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold">{voucher.rewardName}</p>
                    <p className="text-sm text-espresso/75">
                      {describe(voucher.kind, voucher.value)}
                    </p>
                    <p className="text-sm">
                      {t.rewards.voucherCode}:{" "}
                      <span className="break-all font-mono font-semibold tracking-wider">
                        {voucher.code}
                      </span>
                    </p>
                    <p
                      className={`text-xs font-medium ${isReady ? "text-emerald-700" : "text-espresso/55"}`}
                    >
                      {statusLabel} ·{" "}
                      {formatDateTime(voucher.createdAt, locale)}
                    </p>
                    {isReady ? (
                      <p className="text-xs text-espresso/55">
                        {voucher.expiresAt
                          ? t.rewards.expires(
                              formatDate(voucher.expiresAt, locale),
                            )
                          : t.rewards.noExpiry}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
