import { PublicShell } from "@/components/public-shell";
import { cardClass, sectionTitleClass } from "@/components/ui";
import { getOutlets } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";

export const instant = false;

export default async function OutletsPage() {
  const { t } = await getT();
  const list = await getOutlets();

  return (
    <PublicShell>
      <h1 className="text-3xl font-bold tracking-tight">{t.outlets.title}</h1>
      <p className="mt-2 text-espresso/70">{t.outlets.body}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((outlet) => (
          <article key={outlet.id} className={cardClass}>
            <h2 className={sectionTitleClass}>{outlet.name}</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-espresso/60">
                  {t.outlets.address}
                </dt>
                <dd>{outlet.address}</dd>
              </div>
              <div>
                <dt className="font-medium text-espresso/60">
                  {t.outlets.hours}
                </dt>
                <dd>{outlet.hours}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </PublicShell>
  );
}
