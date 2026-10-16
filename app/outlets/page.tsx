import { FeatureItem } from "@/components/brand/feature-item";
import { PublicShell } from "@/components/public-shell";
import { getOutlets } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";

export const instant = false;

export default async function OutletsPage() {
  const { t } = await getT();
  const list = await getOutlets();

  return (
    <PublicShell>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        {t.outlets.title}
      </h1>
      <p className="mt-2 text-muted">{t.outlets.body}</p>
      <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
        {list.map((outlet) => (
          <FeatureItem key={outlet.id} title={outlet.name} titleAs="h2">
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold text-espresso">
                  {t.outlets.address}
                </dt>
                <dd>{outlet.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-espresso">
                  {t.outlets.hours}
                </dt>
                <dd>{outlet.hours}</dd>
              </div>
            </dl>
          </FeatureItem>
        ))}
      </div>
    </PublicShell>
  );
}
