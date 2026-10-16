import { PublicShell } from "@/components/public-shell";
import { COMPANY, LEGAL_VERSION } from "@/lib/legal";
import { connection } from "next/server";

export const instant = false;

const operator = `${COMPANY.legalName} (${COMPANY.registrationNo})`;

const sections = [
  {
    title: "1. About these terms",
    body: [
      `These Terms & Conditions apply to the YDM-KS-Points program (the "Program") operated by ${operator} ("we", "us"). By registering you agree to these terms and our Privacy Policy.`,
    ],
  },
  {
    title: "2. Eligibility",
    body: [
      "You must be at least [minimum age] years old to join. You must give accurate information, including a valid Malaysian mobile number, your real name and a working email address.",
    ],
  },
  {
    title: "3. Your account",
    body: [
      "You may hold one account. Keep your phone and account details secure and tell us as soon as possible if you think your account has been misused. You are responsible for activity on your account.",
    ],
  },
  {
    title: "4. Points",
    body: [
      "Points are earned on purchases at the rate shown in the Program, through the first-purchase bonus, and by completing tasks.",
      "Points have no cash value, cannot be transferred or sold, and do not expire. We may adjust points for returned or cancelled purchases, errors or misuse.",
    ],
  },
  {
    title: "5. Vouchers",
    body: [
      "Vouchers are issued as shown on the Rewards page and display any expiry date. Each voucher can be used once, is shown to staff as a QR code, and cannot be exchanged for cash.",
      "We may refuse a voucher that is expired, already used or altered. Vouchers cannot be combined unless we say so.",
    ],
  },
  {
    title: "6. Tasks",
    body: [
      "Tasks are optional actions, such as visiting a listing or following our social pages. Complete tasks in good faith. Each task can be claimed once.",
      "We may reverse points for tasks that are fake, automated or otherwise abusive.",
    ],
  },
  {
    title: "7. Changes to the Program",
    body: [
      "We may change the Program, its point rates, rewards or these terms. We will give [notice period] notice of material changes through the app.",
      "A change does not remove points already credited, except as set out in clauses 4 and 8.",
    ],
  },
  {
    title: "8. Suspension and misuse",
    body: [
      "We may suspend or close an account, and reverse points or vouchers, if we reasonably believe there is fraud, misuse, multiple accounts, impersonation or a breach of these terms. Points on a closed account for misuse may be forfeited.",
    ],
  },
  {
    title: "9. Liability",
    body: [
      "To the extent permitted by law, we are not liable for indirect or consequential loss arising from the Program. Nothing in these terms limits rights you have under Malaysian law that cannot be excluded, including under the Consumer Protection Act 1999 where it applies.",
    ],
  },
  {
    title: "10. Personal data",
    body: ["We handle your personal data as described in our Privacy Policy."],
  },
  {
    title: "11. Governing law",
    body: [
      `These terms are governed by the laws of ${COMPANY.jurisdiction}, and the courts of ${COMPANY.jurisdiction} have jurisdiction.`,
    ],
  },
  {
    title: "12. Contact",
    body: [
      `Questions about these terms: ${COMPANY.contactEmail}, ${COMPANY.contactPhone}, ${COMPANY.registeredAddress}.`,
    ],
  },
];

export default async function TermsPage() {
  await connection();

  return (
    <PublicShell>
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="inline-block rounded-full bg-roast/10 px-3 py-1 text-xs font-semibold text-roast">
            Draft. Pending legal review before launch.
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Terms & Conditions
          </h1>
        </header>

        {sections.map((section) => (
          <section
            key={section.title}
            className="space-y-3 border-t border-espresso/10 pt-6"
          >
            <h2 className="text-lg font-bold tracking-tight">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-6 text-espresso/80">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <p className="text-xs text-muted">Version {LEGAL_VERSION}</p>
      </div>
    </PublicShell>
  );
}
