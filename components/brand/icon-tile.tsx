import type { ReactNode } from "react";

const tones = {
  roast: "bg-roast/10 text-roast",
  muted: "bg-espresso/5 text-muted",
} as const;

export function IconTile({
  tone = "roast",
  children,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
