import { PublicShell } from "@/components/public-shell";
import { buttonClass, cardClass, sectionTitleClass } from "@/components/ui";
import { getSettings } from "@/lib/config";
import { getActiveTaskPoints, getCupsVoucherType } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import { getCustomerId } from "@/lib/session";
import Link from "next/link";
import { connection } from "next/server";

export const instant = false;

export default async function HomePage() {
  await connection();
  const { t } = await getT();
  const { pointsPerRinggit, firstPurchaseBonusPoints } = await getSettings();
  const cupsTarget = (await getCupsVoucherType())?.triggerCount ?? 0;
  const taskPoints = await getActiveTaskPoints();
  const googlePoints = taskPoints.google_profile ?? 0;
  const followPoints = Math.max(
    taskPoints.follow_instagram ?? 0,
    taskPoints.follow_tiktok ?? 0,
  );
  const loggedIn = (await getCustomerId()) !== null;

  const earnCards = [
    {
      title: t.landing.earnPurchaseTitle,
      body: t.landing.pointsLine(pointsPerRinggit),
    },
    {
      title: t.landing.earnFirstTitle,
      body: t.landing.earnFirstBody(firstPurchaseBonusPoints),
    },
    ...(googlePoints > 0
      ? [
          {
            title: t.landing.earnGoogleTitle,
            body: t.landing.earnGoogleBody(googlePoints),
          },
        ]
      : []),
    ...(followPoints > 0
      ? [
          {
            title: t.landing.earnFollowTitle,
            body: t.landing.earnFollowBody(followPoints),
          },
        ]
      : []),
  ];

  const rewardCards = [
    {
      value: t.landing.rewardWelcomeValue,
      title: t.landing.rewardWelcomeTitle,
      body: t.landing.rewardWelcomeBody,
    },
    {
      value: t.landing.rewardBirthdayValue,
      title: t.landing.rewardBirthdayTitle,
      body: t.landing.rewardBirthdayBody,
    },
    ...(cupsTarget > 0
      ? [
          {
            value: t.landing.rewardCupsValue,
            title: t.landing.rewardCupsTitle(cupsTarget),
            body: t.landing.rewardCupsBody,
          },
        ]
      : []),
    {
      value: t.landing.rewardPointsValue,
      title: t.landing.rewardPointsTitle,
      body: t.landing.rewardPointsBody,
    },
  ];

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
              href={loggedIn ? "/dashboard" : "/register"}
              className={`${buttonClass("primary")} w-full sm:w-auto`}
            >
              {loggedIn ? t.nav.dashboard : t.landing.join}
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

      <section className="mt-14 space-y-5">
        <h2 className={sectionTitleClass}>{t.landing.earnTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {earnCards.map((card) => (
            <div key={card.title} className={cardClass}>
              <p className="font-semibold">{card.title}</p>
              <p className="mt-1 text-sm text-espresso/70">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 space-y-5">
        <h2 className={sectionTitleClass}>{t.landing.rewardsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {rewardCards.map((card) => (
            <div key={card.title} className={`${cardClass} space-y-2`}>
              <p className="text-3xl font-bold tracking-tight text-roast">
                {card.value}
              </p>
              <p className="font-semibold">{card.title}</p>
              <p className="text-sm text-espresso/70">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {loggedIn ? null : (
        <section className="mt-14 rounded-2xl bg-roast p-6 text-cream sm:p-8">
          <div className="max-w-xl space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t.landing.joinTitle}
            </h2>
            <p className="text-cream/85">{t.auth.welcomePerk}</p>
            <Link href="/register" className={buttonClass("secondary")}>
              {t.landing.join}
            </Link>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
