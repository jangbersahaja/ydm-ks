import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/session";
import type { ReactNode } from "react";

export const instant = false;

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <AdminNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        {children}
      </main>
    </>
  );
}
