"use server";

import { LOCALE_COOKIE } from "@/lib/cookies";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function setLocaleAction(locale: string) {
  if (!LOCALES.includes(locale as Locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
