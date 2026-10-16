import type { ReactNode } from "react";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
