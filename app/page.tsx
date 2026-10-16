import { Badge } from "@/components/brand/badge";
import { FeatureItem } from "@/components/brand/feature-item";
import { SectionHeader } from "@/components/brand/section-header";
import { PublicShell } from "@/components/public-shell";
import { buttonClass } from "@/components/ui";
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
    <PublicShell showLegalLinks>
      <section className="space-y-6 py-4">
        <p className="text-sm font-bold uppercase tracking-wide text-roast">
          {t.programName}
        </p>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {t.landing.heroTitle}
        </h1>
        <p className="max-w-xl text-base text-muted sm:text-lg">
          {t.landing.heroBody}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge>{t.landing.pointsLine(pointsPerRinggit)}</Badge>
          {cupsTarget > 0 ? (
            <Badge>{t.landing.cupsLine(cupsTarget)}</Badge>
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
      </section>

      <section className="mt-16 space-y-6">
        <SectionHeader title={t.landing.earnTitle} />
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {earnCards.map((card) => (
            <FeatureItem key={card.title} title={card.title}>
              {card.body}
            </FeatureItem>
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-6">
        <SectionHeader title={t.landing.rewardsTitle} />
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {rewardCards.map((card) => (
            <FeatureItem key={card.title} value={card.value} title={card.title}>
              {card.body}
            </FeatureItem>
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-6 rounded-3xl bg-roast p-6 text-cream sm:p-8">
        <h2 className="text-2xl font-extrabold tracking-tight">
          {t.landing.howTitle}
        </h2>
        <ol className="space-y-6">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="text-4xl font-extrabold leading-none tabular-nums text-latte">
                {index + 1}
              </span>
              <div className="space-y-1">
                <p className="font-bold">{step.title}</p>
                <p className="text-sm leading-6">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {loggedIn ? null : (
        <section className="mt-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {t.landing.joinTitle}
          </h2>
          <p className="max-w-xl text-muted">{t.auth.welcomePerk}</p>
          <Link href="/register" className={buttonClass("primary")}>
            {t.landing.join}
          </Link>
        </section>
      )}
    </PublicShell>
  );
}
