import { PublicShell } from "@/components/public-shell";
import { buttonClass, cardClass, sectionTitleClass } from "@/components/ui";
import { getSettings } from "@/lib/config";
import { getCupsVoucherType } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import Link from "next/link";

export const instant = false;

export default async function HomePage() {
  const { t } = await getT();
  const { pointsPerRinggit } = await getSettings();
  const cupsTarget = (await getCupsVoucherType())?.triggerCount ?? 0;

  const steps = [
    { title: t.landing.step1Title, body: t.landing.step1Body },
    { title: t.landing.step2Title, body: t.landing.step2Body },
    { title: t.landing.step3Title, body: t.landing.step3Body },
  ];

  return (
    <PublicShell>
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-roast">
            {t.programName}
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t.landing.heroTitle}
          </h1>
          <p className="text-base text-espresso/75 sm:text-lg">
            {t.landing.heroBody}
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="inline-block rounded-full bg-latte/50 px-4 py-2 text-sm font-semibold">
              {t.landing.pointsLine(pointsPerRinggit)}
            </p>
            {cupsTarget > 0 ? (
              <p className="inline-block rounded-full bg-latte/50 px-4 py-2 text-sm font-semibold">
                {t.landing.cupsLine(cupsTarget)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/register"
              className={`${buttonClass("primary")} w-full sm:w-auto`}
            >
              {t.landing.join}
            </Link>
            <Link
              href="/outlets"
              className={`${buttonClass("secondary")} w-full sm:w-auto`}
            >
              {t.landing.viewOutlets}
            </Link>
          </div>
        </div>

        <div className={`${cardClass} space-y-5`}>
          <h2 className={sectionTitleClass}>{t.landing.howTitle}</h2>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-roast text-sm font-bold text-cream">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-espresso/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PublicShell>
  );
}
