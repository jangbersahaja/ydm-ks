import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { pageWidthClass } from "@/components/ui";
import type { ReactNode } from "react";

export function PublicShell({
  children,
  showLegalLinks = false,
}: {
  children: ReactNode;
  showLegalLinks?: boolean;
}) {
  return (
    <>
      <SiteHeader />
      <main className={`${pageWidthClass} flex-1 px-5 py-8 sm:py-12`}>
        {children}
      </main>
      <SiteFooter showLegalLinks={showLegalLinks} />
    </>
  );
}
