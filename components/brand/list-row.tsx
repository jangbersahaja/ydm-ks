import type { ReactNode } from "react";

export function ListGroup({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-espresso/10">{children}</ul>;
}

// Flat row separated by ListGroup dividers. Use instead of a boxed card.
export function ListRow({
  icon,
  trailing,
  children,
}: {
  icon?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-4 py-4">
      {icon}
      <div className="min-w-0 flex-1 space-y-1">{children}</div>
      {trailing}
    </li>
  );
}
