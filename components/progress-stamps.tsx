export function ProgressStamps({
  filled,
  total,
}: {
  filled: number;
  total: number;
}) {
  const count = Math.max(total, 1);
  const shown = Math.min(filled, count);
  const columns = count === 10 ? "grid-cols-5" : "grid-cols-7";
  return (
    <div
      role="img"
      className={`grid gap-2 ${columns}`}
      aria-label={`${shown} of ${count}`}
    >
      {Array.from({ length: count }, (_, i) => {
        const done = i < shown;
        return (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-full text-sm font-semibold ${
              done
                ? "bg-roast text-cream"
                : "bg-espresso/5 text-espresso/40 ring-1 ring-espresso/10"
            }`}
          >
            {done ? "\u2713" : i + 1}
          </div>
        );
      })}
    </div>
  );
}
