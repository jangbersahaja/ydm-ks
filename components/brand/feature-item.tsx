import type { ReactNode } from "react";

// Flat block marked by a brand rule. Replaces boxed cards on public pages.
export function FeatureItem({
  value,
  title,
  titleAs: Title = "p",
  children,
}: {
  value?: string;
  title: string;
  titleAs?: "h2" | "h3" | "p";
  children?: ReactNode;
}) {
  return (
    <div className="space-y-2 border-t-2 border-roast pt-4">
      {value ? (
        <p className="text-4xl font-extrabold tracking-tight tabular-nums text-roast">
          {value}
        </p>
      ) : null}
      <Title className="font-bold">{title}</Title>
      {children ? (
        <div className="text-sm leading-6 text-muted">{children}</div>
      ) : null}
    </div>
  );
}
