import { pageWidthClass } from "@/components/ui";
import { getT } from "@/lib/i18n";
import { COMPANY } from "@/lib/legal";
import Link from "next/link";

export async function SiteFooter({
  showLegalLinks = false,
}: {
  showLegalLinks?: boolean;
}) {
  const { t } = await getT();

  return (
    <footer className="mt-16 border-t border-espresso/10">
      <div
        className={`${pageWidthClass} flex flex-col gap-6 px-5 py-8 text-sm text-espresso/70 sm:flex-row sm:items-start sm:justify-between`}
      >
        <div className="space-y-1">
          <p className="font-semibold text-espresso">{COMPANY.legalName}</p>
          <p>Registration no. {COMPANY.registrationNo}</p>
          <p>{COMPANY.registeredAddress}</p>
          <p>{COMPANY.contactEmail}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
          {showLegalLinks ? (
            <>
              <Link href="/faq" className="hover:text-roast">
                {t.footer.faq}
              </Link>
              <Link href="/terms" className="hover:text-roast">
                {t.footer.terms}
              </Link>
              <Link href="/privacy" className="hover:text-roast">
                {t.footer.privacy}
              </Link>
            </>
          ) : null}
          <Link href="/outlets" className="hover:text-roast">
            {t.nav.outlets}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
