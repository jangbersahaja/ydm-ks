import type { Locale } from "@/lib/i18n/dictionaries";

export function formatRM(cents: number) {
  return `RM ${(cents / 100).toFixed(2)}`;
}

export function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateOnly(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTime(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
