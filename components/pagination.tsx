import Link from "next/link";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
  pageLabel: string;
};

const linkClass =
  "inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-espresso ring-1 ring-espresso/15 transition hover:opacity-90";

const disabledClass =
  "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-espresso/30 ring-1 ring-espresso/10";

export function Pagination({
  basePath,
  page,
  totalPages,
  prevLabel,
  nextLabel,
  pageLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (n: number) => `${basePath}?page=${n}`;

  return (
    <nav className="flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass}>
          {prevLabel}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {prevLabel}
        </span>
      )}
      <span className="text-sm text-espresso/70 tabular-nums">{pageLabel}</span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClass}>
          {nextLabel}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {nextLabel}
        </span>
      )}
    </nav>
  );
}
