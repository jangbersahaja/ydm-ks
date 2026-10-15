import { Pagination } from "@/components/pagination";
import { PurchaseForm } from "@/components/purchase-form";
import { cardClass, sectionTitleClass } from "@/components/ui";
import { getOutlets, getRecentPurchases } from "@/lib/db/queries";
import { formatDateTime, formatRM } from "@/lib/format";
import { getT } from "@/lib/i18n";

type CounterProps = {
  // Route the counter lives on, e.g. "/admin" or "/staff/ksnus".
  basePath: string;
  page?: string;
  // Set for staff: purchases are locked to this outlet and the list is filtered to it.
  outlet?: { id: number; name: string } | null;
};

export async function Counter({ basePath, page, outlet }: CounterProps) {
  return (
    <div className="flex flex-col gap-6">
      <PurchaseSection
        basePath={basePath}
        page={Number(page)}
        outlet={outlet ?? null}
      />
    </div>
  );
}

async function PurchaseSection({
  basePath,
  page,
  outlet,
}: {
  basePath: string;
  page: number;
  outlet: { id: number; name: string } | null;
}) {
  const { t, locale } = await getT();
  const [outletList, { rows: records, page: current, totalPages }] =
    await Promise.all([getOutlets(), getRecentPurchases(page, outlet?.id)]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.purchaseTitle}
        </h1>
        <p className="mt-1 text-sm text-espresso/70">{t.admin.purchaseBody}</p>
      </div>

      <div className={cardClass}>
        <PurchaseForm
          outlet={outlet}
          outlets={outletList.map((item) => ({ id: item.id, name: item.name }))}
          loginPath={`${basePath}/login`}
          labels={{
            member: t.admin.member,
            placeholder: t.auth.phone,
            scanLabel: t.admin.scan,
            stopLabel: t.admin.stopScan,
            scanHint: t.admin.scanHint,
            scanError: t.admin.scanError,
            scanInsecure: t.admin.scanInsecure,
            memberNotFound: t.admin.memberNotFound,
            lookupFailed: t.admin.errors.lookupFailed,
            outlet: t.admin.outlet,
            amount: t.admin.amount,
            cups: t.admin.cups,
            cupsHint: t.admin.cupsHint,
            code: t.admin.code,
            drinkPrice: t.admin.drinkPrice,
            drinkPriceHint: t.admin.drinkPriceHint,
            voucherIncomplete: t.admin.voucherIncomplete,
            record: t.admin.record,
            confirmTitle: t.admin.confirmPurchaseTitle,
            confirm: t.admin.confirmPurchase,
            cancel: t.admin.cancelPurchase,
            close: t.admin.close,
          }}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className={sectionTitleClass}>{t.admin.recentPurchases}</h2>
        {records.length === 0 ? (
          <p className="text-sm text-espresso/70">
            {t.admin.noPurchaseRecords}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {records.map((row) => (
              <li
                key={row.id}
                className={`${cardClass} flex items-start justify-between gap-3`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{row.customerName}</p>
                  <p className="text-sm text-espresso/70">
                    {row.outletName} · {formatRM(row.amountCents)}
                    {row.cups > 0 ? ` · ${t.admin.cupsCount(row.cups)}` : ""}
                  </p>
                  {row.discountCents > 0 ? (
                    <span className="mt-1.5 inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                      {t.admin.voucherApplied(
                        row.voucherName ?? "",
                        formatRM(row.discountCents),
                      )}
                    </span>
                  ) : null}
                  <p className="mt-1 text-xs text-espresso/60 tabular-nums">
                    {formatDateTime(row.createdAt, locale)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-roast tabular-nums">
                  {t.admin.earnedPoints(row.points)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          basePath={basePath}
          page={current}
          totalPages={totalPages}
          prevLabel={t.admin.previousPage}
          nextLabel={t.admin.nextPage}
          pageLabel={t.admin.pageOf(current, totalPages)}
        />
      </section>
    </>
  );
}
