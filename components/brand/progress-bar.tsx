export function ProgressBar({
  percent,
  tone = "roast",
  label,
}: {
  percent: number;
  tone?: "roast" | "cream";
  label?: string;
}) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  const track = tone === "cream" ? "bg-cream/25" : "bg-espresso/10";
  const fill = tone === "cream" ? "bg-cream" : "bg-roast";
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full ${track}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${fill}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
