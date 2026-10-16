import Link from "next/link";
import type { ReactNode } from "react";

export type VoucherDetailsLabels = {
  validityTitle: string;
  minSpendTitle: string;
  claimTitle: string;
  termsTitle: string;
  fullTerms: string;
  standardTerms: string[];
  useAtCounter: string;
};

export type VoucherDetailsProps = {
  labels: VoucherDetailsLabels;
  validity: string;
  validityNote?: string;
  minSpend: string;
  claim: string;
  terms: string | null;
};

export function VoucherDetails({
  labels,
  validity,
  validityNote,
  minSpend,
  claim,
  terms,
}: VoucherDetailsProps) {
  return (
    <div className="w-full space-y-5 text-left text-sm">
      <DetailBlock title={labels.validityTitle}>
        <p>{validity}</p>
        {validityNote ? <p className="text-muted">{validityNote}</p> : null}
      </DetailBlock>

      <DetailBlock title={labels.minSpendTitle}>
        <p>{minSpend}</p>
      </DetailBlock>

      <DetailBlock title={labels.claimTitle}>
        <p>{claim}</p>
        <p className="text-muted">{labels.useAtCounter}</p>
      </DetailBlock>

      <DetailBlock title={labels.termsTitle}>
        {terms ? <p className="whitespace-pre-line">{terms}</p> : null}
        <ol className="list-decimal space-y-1 pl-5 text-muted">
          {labels.standardTerms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ol>
        <Link href="/terms" className="font-semibold text-roast">
          {labels.fullTerms}
        </Link>
      </DetailBlock>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {title}
      </p>
      {children}
    </section>
  );
}
