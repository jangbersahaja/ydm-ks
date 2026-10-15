import { BottomNav } from "@/components/bottom-nav";
import {
  GiftIcon,
  HistoryIcon,
  HomeIcon,
  ListCheckIcon,
  UserIcon,
} from "@/components/icons";
import { PurchaseAlert } from "@/components/purchase-alert";
import { SiteHeader } from "@/components/site-header";
import { pageWidthClass } from "@/components/ui";
import { getLatestPurchaseId } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
import Link from "next/link";
import type { ReactNode } from "react";

export const instant = false;

export default async function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  const customerId = await requireCustomerId();
  const { t } = await getT();
  const latestPurchaseId = await getLatestPurchaseId(customerId);

  const items = [
    { href: "/dashboard", label: t.nav.home, icon: HomeIcon },
    { href: "/tasks", label: t.nav.tasks, icon: ListCheckIcon },
    { href: "/rewards", label: t.nav.rewards, icon: GiftIcon },
    { href: "/history", label: t.nav.history, icon: HistoryIcon },
    { href: "/profile", label: t.nav.profile, icon: UserIcon },
  ];

  return (
    <>
      <SiteHeader />
      <main className={`${pageWidthClass} flex-1 px-5 pb-28 pt-6`}>
        {children}
        <nav className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-roast">
          <Link href="/faq">{t.footer.faq}</Link>
          <Link href="/terms">{t.footer.terms}</Link>
          <Link href="/privacy">{t.footer.privacy}</Link>
        </nav>
      </main>
      <PurchaseAlert
        initialPurchaseId={latestPurchaseId}
        labels={t.purchaseAlert}
      />
      <BottomNav items={items} />
    </>
  );
}
