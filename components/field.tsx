import { labelClass } from "@/components/ui";
import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-espresso/55">{hint}</span>
      ) : null}
    </label>
  );
}
