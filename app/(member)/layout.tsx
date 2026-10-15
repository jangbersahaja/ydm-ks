import { BottomNav } from "@/components/bottom-nav";
import { PurchaseAlert } from "@/components/purchase-alert";
import { SiteHeader } from "@/components/site-header";
import { pageWidthClass } from "@/components/ui";
import { getLatestPurchaseId } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
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
    { href: "/dashboard", label: t.nav.home, icon: "home" as const },
    { href: "/tasks", label: t.nav.tasks, icon: "tasks" as const },
    { href: "/rewards", label: t.nav.rewards, icon: "rewards" as const },
    { href: "/history", label: t.nav.history, icon: "history" as const },
    { href: "/profile", label: t.nav.profile, icon: "profile" as const },
  ];

  return (
    <>
      <SiteHeader />
      <main className={`${pageWidthClass} flex-1 px-5 pb-28 pt-6`}>
        {children}
      </main>
      <PurchaseAlert
        initialPurchaseId={latestPurchaseId}
        labels={t.purchaseAlert}
      />
      <BottomNav items={items} />
    </>
  );
}
