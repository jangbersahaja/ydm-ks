import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { getT } from "@/lib/i18n";
import { requireCustomerId } from "@/lib/session";
import type { ReactNode } from "react";

export const instant = false;

export default async function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireCustomerId();
  const { t } = await getT();

  const items = [
    { href: "/dashboard", label: t.nav.home },
    { href: "/tasks", label: t.nav.tasks },
    { href: "/rewards", label: t.nav.rewards },
    { href: "/history", label: t.nav.history },
    { href: "/profile", label: t.nav.profile },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-28 pt-6">
        {children}
      </main>
      <BottomNav items={items} />
    </>
  );
}
