import { Badge } from "@/components/brand/badge";
import Link from "next/link";

export type SegmentItem = {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
};

// Two-item tab switch rendered as links so each tab is a server-navigable URL.
export function SegmentedControl({ items }: { items: SegmentItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-espresso/5 p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
            item.active
              ? "bg-roast text-cream"
              : "text-espresso hover:text-roast"
          }`}
        >
          {item.label}
          {item.badge ? (
            <Badge tone={item.active ? "inverse" : "solid"}>{item.badge}</Badge>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
