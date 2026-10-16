import type { ReactNode } from "react";

const tones = {
  soft: "bg-white/70 text-espresso",
  solid: "bg-roast text-cream",
  inverse: "bg-cream text-roast",
} as const;

export function Badge({
  tone = "soft",
  className = "",
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${tones[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
