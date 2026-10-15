import { LOCALE_COOKIE } from "@/lib/cookies";
import { cookies } from "next/headers";
import { dictionaries, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "ms" ? "ms" : "en";
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
