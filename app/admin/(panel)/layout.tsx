import { AdminNav } from "@/components/admin-nav";
import { pageWidthClass } from "@/components/ui";
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
      <main className={`${pageWidthClass} flex-1 px-5 py-8`}>{children}</main>
    </>
  );
}
