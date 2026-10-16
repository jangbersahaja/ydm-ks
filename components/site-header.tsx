import { Badge } from "@/components/brand/badge";
import { LocaleToggle } from "@/components/locale-toggle";
import { pageWidthClass } from "@/components/ui";
import { getT } from "@/lib/i18n";
import { getCustomerId } from "@/lib/session";
import Link from "next/link";

export async function SiteHeader() {
  const { t, locale } = await getT();
  const loggedIn = (await getCustomerId()) !== null;

  return (
    <header className="sticky top-0 z-10 border-b border-espresso/10 bg-latte/90 backdrop-blur">
      <div
        className={`${pageWidthClass} flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-base font-bold tracking-tight text-espresso">
            {t.brand}
          </span>
          <Badge className="text-[10px] uppercase tracking-wide">
            {t.demo}
          </Badge>
        </Link>
        <nav className="flex w-full items-center justify-end gap-3 text-sm font-medium text-espresso sm:w-auto">
          <Link href="/outlets" className="hidden sm:inline hover:text-roast">
            {t.nav.outlets}
          </Link>
          {loggedIn ? (
            <Link href="/dashboard" className="hover:text-roast">
              {t.nav.dashboard}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-roast">
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-roast px-3 py-1.5 text-cream hover:opacity-90"
              >
                {t.nav.join}
              </Link>
            </>
          )}
          <LocaleToggle current={locale} />
        </nav>
      </div>
    </header>
  );
}
