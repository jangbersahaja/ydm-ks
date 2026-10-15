const base =
  "inline-flex items-center justify-center rounded-full font-semibold transition duration-150 select-none active:scale-[0.98] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roast disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const sizes = {
  md: "min-h-12 px-6 py-3 text-base",
  sm: "min-h-10 px-4 py-2 text-sm",
} as const;

const variants = {
  primary: "bg-roast text-cream",
  secondary: "bg-white text-espresso ring-1 ring-espresso/15",
  accent: "bg-accent text-white",
} as const;

export function buttonClass(
  variant: keyof typeof variants = "primary",
  extra = "",
) {
  return `${base} ${sizes.md} ${variants[variant]} ${extra}`.trim();
}

export function buttonSmClass(
  variant: keyof typeof variants = "primary",
  extra = "",
) {
  return `${base} ${sizes.sm} ${variants[variant]} ${extra}`.trim();
}

const iconBase =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-150 select-none active:scale-95 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roast disabled:cursor-not-allowed disabled:opacity-50";

const iconVariants = {
  primary: "bg-roast text-white",
  secondary: "bg-white text-espresso ring-1 ring-espresso/15",
} as const;

// Circular icon-only button. Pair with aria-label and title for accessibility.
export function iconButtonClass(
  variant: keyof typeof iconVariants = "primary",
  extra = "",
) {
  return `${iconBase} ${iconVariants[variant]} ${extra}`.trim();
}

export const cardClass =
  "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/5";

export const inputClass =
  "min-h-12 w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-base text-espresso placeholder:text-espresso/40 focus:border-roast focus:outline-none focus:ring-2 focus:ring-roast/30";

export const labelClass = "mb-1.5 block text-sm font-medium text-espresso";

export const sectionTitleClass = "text-lg font-semibold text-espresso";

// Shared content width for every page and its header/footer/nav.
export const pageWidthClass = "mx-auto w-full max-w-3xl";
