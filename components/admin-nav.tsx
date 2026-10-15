import { adminLogoutAction } from "@/app/actions/admin";
import { LogOutIcon } from "@/components/icons";
import { iconButtonClass } from "@/components/ui";
import { getT } from "@/lib/i18n";
import Link from "next/link";

export async function AdminNav() {
  const { t } = await getT();
  const items = [
    { href: "/admin", label: t.admin.navPurchase },
    { href: "/admin/redeem", label: t.admin.navRedeem },
    { href: "/admin/vouchers", label: t.admin.navVouchers },
    { href: "/admin/settings", label: t.admin.navSettings },
  ];
  return (
    <header className="border-b border-espresso/10 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="font-bold text-espresso">
            {t.brand} · Staff
          </Link>
          <form action={adminLogoutAction} className="sm:hidden">
            <button
              type="submit"
              aria-label={t.admin.logout}
              title={t.admin.logout}
              className={iconButtonClass("secondary")}
            >
              <LogOutIcon />
            </button>
          </form>
        </div>
        <nav className="-mx-5 flex items-center gap-1 overflow-x-auto px-5 text-sm font-medium text-espresso [scrollbar-width:none] sm:mx-0 sm:gap-4 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 shrink-0 items-center rounded-full px-3 hover:text-roast sm:px-0"
            >
              {item.label}
            </Link>
          ))}
          <form action={adminLogoutAction} className="hidden sm:block">
            <button
              type="submit"
              aria-label={t.admin.logout}
              title={t.admin.logout}
              className={iconButtonClass("secondary")}
            >
              <LogOutIcon />
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
