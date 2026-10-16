import { cardClass } from "@/components/ui";
import type { ReactNode } from "react";

// Flat sits on the page background. Panel is white and only for forms and scannable content.
export function Surface({
  variant = "flat",
  className = "",
  children,
}: {
  variant?: "flat" | "panel";
  className?: string;
  children: ReactNode;
}) {
  const base = variant === "panel" ? cardClass : "";
  return <div className={`${base} ${className}`.trim()}>{children}</div>;
}
