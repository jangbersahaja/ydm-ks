"use client";

import { pageWidthClass } from "@/components/ui";
import {
  GiftIcon,
  HistoryIcon,
  HomeIcon,
  ListCheckIcon,
  UserIcon,
} from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
  icon: "home" | "tasks" | "rewards" | "history" | "profile";
};

const icons = {
  home: HomeIcon,
  tasks: ListCheckIcon,
  rewards: GiftIcon,
  history: HistoryIcon,
  profile: UserIcon,
} as const;

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-espresso/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className={`${pageWidthClass} grid grid-cols-5 gap-1 px-2 py-1.5`}>
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = icons[item.icon];
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center justify-center rounded-xl px-1 text-center text-xs font-semibold leading-tight transition ${
                  active
                    ? "bg-roast/10 text-roast"
                    : "text-espresso/60 active:bg-espresso/5"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
