import { getLocale } from "@/lib/i18n";
import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YDM-KS-Points (Demo)",
  description:
    "Demo loyalty app: earn points on every visit and redeem a free drink.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e6b549",
};

export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`h-full antialiased ${archivo.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
