import { cardClass } from "@/components/ui";

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-xs font-medium text-espresso/60">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-espresso">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-espresso/60">{hint}</p> : null}
    </div>
  );
}

export type ChartPoint = {
  title: string;
  axis: string;
  value: number;
  display: string;
};

// Column heights are relative to the largest value in the series.
export function ColumnChart({
  points,
  emptyLabel,
}: {
  points: ChartPoint[];
  emptyLabel: string;
}) {
  if (points.length === 0) {
    return <p className="text-sm text-espresso/70">{emptyLabel}</p>;
  }
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div>
      <div className="flex h-40 items-end gap-1">
        {points.map((point, index) => (
          <div
            key={`${index}-${point.title}`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
            title={`${point.title}: ${point.display}`}
          >
            <div
              className="rounded-t bg-roast/80"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[10px] text-espresso/60">
        {points.map((point, index) => (
          <span
            key={`${index}-${point.title}`}
            className="min-w-0 flex-1 truncate text-center"
          >
            {point.axis}
          </span>
        ))}
      </div>
    </div>
  );
}

export type BarRow = { label: string; value: number; display: string };

export function BarList({
  rows,
  emptyLabel,
}: {
  rows: BarRow[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-espresso/70">{emptyLabel}</p>;
  }
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((row, index) => (
        <li key={`${index}-${row.label}`}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate font-medium text-espresso">
              {row.label}
            </span>
            <span className="shrink-0 tabular-nums text-espresso/80">
              {row.display}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-espresso/10">
            <div
              className="h-2 rounded-full bg-roast"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
