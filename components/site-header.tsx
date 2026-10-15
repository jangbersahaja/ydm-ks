import { LocaleToggle } from "@/components/locale-toggle";
import { getT } from "@/lib/i18n";
import { getCustomerId } from "@/lib/session";
import Link from "next/link";

export async function SiteHeader() {
  const { t, locale } = await getT();
  const loggedIn = (await getCustomerId()) !== null;

  return (
    <header className="sticky top-0 z-10 border-b border-espresso/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-espresso">
            {t.brand}
          </span>
          <span className="rounded-full bg-latte/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-espresso">
            {t.demo}
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-espresso">
          <Link href="/outlets" className="hidden sm:inline hover:text-roast">
            {t.nav.outlets}
          </Link>
          {loggedIn ? (
            <Link href="/dashboard" className="hover:text-roast">
              {t.nav.dashboard}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-roast">
              {t.nav.login}
            </Link>
          )}
          <LocaleToggle current={locale} />
        </nav>
      </div>
    </header>
  );
}
