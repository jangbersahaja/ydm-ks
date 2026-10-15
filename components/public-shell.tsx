import { SiteHeader } from "@/components/site-header";
import type { ReactNode } from "react";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:py-12">
        {children}
      </main>
    </>
  );
}
