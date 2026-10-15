import { PublicShell } from "@/components/public-shell";
import { cardClass } from "@/components/ui";
import { getSettings } from "@/lib/config";
import { getCupsVoucherType } from "@/lib/db/queries";
import { COMPANY } from "@/lib/legal";
import { connection } from "next/server";

export const instant = false;

export default async function FaqPage() {
  await connection();
  const [settings, cups] = await Promise.all([
    getSettings(),
    getCupsVoucherType(),
  ]);

  const perRinggit = settings.pointsPerRinggit;
  const bonus = settings.firstPurchaseBonusPoints;
  const cupsTarget = cups?.triggerCount ?? null;

  const faqs = [
    {
      q: "How do I join?",
      a: "Register with your phone number, full name, email, birthday and the demo code from our staff. Your phone number is your login.",
    },
    {
      q: "How do I earn points?",
      a: `Every RM1 you spend earns ${perRinggit} point${perRinggit === 1 ? "" : "s"}. Show your member QR code at the counter so staff can record your purchase.`,
    },
    {
      q: "Is there a bonus for my first purchase?",
      a: `Yes. You get ${bonus} bonus point${bonus === 1 ? "" : "s"} on your first purchase.`,
    },
    {
      q: "How do free drinks work?",
      a: cupsTarget
        ? `Every ${cupsTarget} cups you buy earns one free drink voucher. Your progress is shown on your dashboard.`
        : "Free drink vouchers are shown on the Rewards page.",
    },
    {
      q: "How do I redeem my points?",
      a: "Open Rewards, choose a voucher and redeem it with your points. Show the voucher QR code at the counter. Each voucher can be used once.",
    },
    {
      q: "Do my points expire?",
      a: "No. Points do not expire.",
    },
    {
      q: "Can I use my points at both outlets?",
      a: "Yes. Points are shared across Kopi Saigon Central I-City and Kopi Saigon NU Sentral.",
    },
    {
      q: "How do I earn points from tasks?",
      a: "Open Tasks and complete a task, such as visiting our Google profile or following our social pages. Each task can be claimed once.",
    },
    {
      q: "Can I change my details?",
      a: "Update your name and email on the Profile page. Your birthday cannot be changed after you register.",
    },
    {
      q: "How do I delete my account?",
      a: `Email ${COMPANY.contactEmail} to request deletion. Some records, such as points history, may be kept where the law requires.`,
    },
    {
      q: "I lost my phone or cannot log in. What do I do?",
      a: `Visit Kopi Saigon Central I-City or Kopi Saigon NU Sentral, or contact us at ${COMPANY.contactEmail}.`,
    },
  ];

  return (
    <PublicShell>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h1>
          <p className="text-espresso/70">
            Quick answers about YDM-KS-Points. The full rules are in our Terms &
            Conditions.
          </p>
        </header>

        <section className="space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className={`${cardClass} group`}>
              <summary className="cursor-pointer list-none font-semibold">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-6 text-espresso/80">
                {item.a}
              </p>
            </details>
          ))}
        </section>

      </div>
    </PublicShell>
  );
}
