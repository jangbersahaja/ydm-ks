"use client";

import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/dictionaries";
import { useTransition } from "react";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ms", label: "BM" },
];

export function LocaleToggle({ current }: { current: Locale }) {
  const [pending, startTransition] = useTransition();
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex rounded-full bg-white p-0.5 text-xs font-semibold ring-1 ring-espresso/15"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={pending}
            aria-pressed={active}
            onClick={() => startTransition(() => setLocaleAction(opt.value))}
            className={`inline-flex min-h-9 min-w-10 items-center justify-center rounded-full px-3 transition active:scale-95 ${
              active ? "bg-roast text-cream" : "text-espresso/70"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
