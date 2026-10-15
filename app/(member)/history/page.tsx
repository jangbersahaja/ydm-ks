import { cardClass, sectionTitleClass } from "@/components/ui";
import { getLedger, getPurchases } from "@/lib/db/queries";
import { formatDateTime, formatRM } from "@/lib/format";
import { getT } from "@/lib/i18n";
import { ledgerLabel } from "@/lib/labels";
import { requireCustomerId } from "@/lib/session";

export const instant = false;

export default async function HistoryPage() {
  const customerId = await requireCustomerId();
  const { t, locale } = await getT();

  const [purchaseRows, ledger] = await Promise.all([
    getPurchases(customerId),
    getLedger(customerId),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">{t.history.title}</h1>

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
      </section>

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
      </section>
    </div>
  );
}
