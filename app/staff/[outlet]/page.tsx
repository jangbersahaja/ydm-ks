import { staffLogoutAction } from "@/app/actions/staff";
import { Counter } from "@/components/counter";
import { LogOutIcon } from "@/components/icons";
import { iconButtonClass, pageWidthClass } from "@/components/ui";
import { STAFF_OUTLETS } from "@/lib/constants";
import { getOutletByCode } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import { requireStaffOutlet } from "@/lib/session";
import { notFound } from "next/navigation";
import { connection } from "next/server";

export const instant = false;

export default async function StaffCounterPage({
  params,
  searchParams,
}: {
  params: Promise<{ outlet: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const { outlet: slug } = await params;
  if (!STAFF_OUTLETS[slug]) notFound();

  const outletCode = await requireStaffOutlet(slug);
  const [outlet, { page }, { t }] = await Promise.all([
    getOutletByCode(outletCode),
    searchParams,
    getT(),
  ]);
  if (!outlet) notFound();

  return (
    <>
      <header className="border-b border-espresso/10 bg-white">
        <div
          className={`${pageWidthClass} flex items-center justify-between gap-3 px-5 py-3`}
        >
          <div className="min-w-0">
            <p className="text-xs text-espresso/60">{t.brand}</p>
            <p className="truncate font-bold text-espresso">{outlet.name}</p>
          </div>
          <form action={staffLogoutAction}>
            <input type="hidden" name="outlet" value={slug} />
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
      </header>
      <main className={`${pageWidthClass} flex-1 px-5 py-8`}>
        <Counter
          basePath={`/staff/${slug}`}
          page={page}
          outlet={{ id: outlet.id, name: outlet.name }}
        />
      </main>
    </>
  );
}
