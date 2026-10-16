import { PublicShell } from "@/components/public-shell";
import { COMPANY, LEGAL_VERSION } from "@/lib/legal";
import { connection } from "next/server";

export const instant = false;

const operator = `${COMPANY.legalName} (${COMPANY.registrationNo})`;

const sections = [
  {
    title: "1. Who we are",
    body: [
      `${operator} is responsible for the personal data collected through the YDM-KS-Points program. We handle your data in line with Malaysia's Personal Data Protection Act 2010 (PDPA).`,
    ],
  },
  {
    title: "2. What we collect",
    body: [
      "Your phone number, full name, email address and birthday. Purchase amounts and outlet, cup and points history, task completions and voucher redemptions.",
    ],
  },
  {
    title: "3. How we use it",
    body: [
      "To run the program: create and secure your account, record purchases and points, issue vouchers (including birthday vouchers), and answer your questions.",
      "[Marketing messages: confirm the channel and opt-in process before launch. We only send them if you opt in.]",
    ],
  },
  {
    title: "4. Who we share it with",
    body: [
      "We share data only with service providers that help us run the program, such as hosting and database providers [list providers and regions before launch], and where the law requires it. We do not sell your personal data.",
    ],
  },
  {
    title: "5. How long we keep it",
    body: [
      "We keep personal data for [retention period] after your account closes, or for as long as the law requires. After that we delete or anonymise it.",
    ],
  },
  {
    title: "6. Your rights",
    body: [
      `Under the PDPA you can ask to access or correct your personal data, withdraw consent to marketing, and ask us to stop certain processing. Send requests to ${COMPANY.dpoEmail}. We will respond within the time the PDPA requires.`,
    ],
  },
  {
    title: "7. Security",
    body: [
      "We use reasonable technical and organisational measures to protect your data, including restricted access for staff accounts and encrypted connections.",
    ],
  },
  {
    title: "8. Cookies",
    body: [
      "We use essential cookies only. They keep you logged in and remember your language choice.",
    ],
  },
  {
    title: "9. Changes to this policy",
    body: [
      "We may update this policy. The current version is shown below, and material changes will be announced through the app.",
    ],
  },
  {
    title: "10. Contact",
    body: [
      `Privacy questions and requests: ${COMPANY.dpoEmail}. Phone: ${COMPANY.contactPhone}. Address: ${COMPANY.registeredAddress}.`,
    ],
  },
];

export default async function PrivacyPage() {
  await connection();

  return (
    <PublicShell>
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="inline-block rounded-full bg-roast/10 px-3 py-1 text-xs font-semibold text-roast">
            Draft. Pending legal review before launch.
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Privacy Policy
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
