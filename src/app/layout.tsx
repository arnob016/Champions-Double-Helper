import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Rubik, Silkscreen } from "next/font/google";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SITE } from "@/lib/site";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

const mono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["Pokémon Champions", "VGC", "doubles", "team preview", "team builder", "type chart", "Mega Evolution", "Showdown"],
  openGraph: { type: "website", siteName: SITE.name, title: SITE.name, description: SITE.description, url: "/" },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
};

export const viewport: Viewport = { themeColor: "#0b0f1b", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rubik.variable} ${mono.variable} ${silkscreen.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only z-50 rounded-md border-2 border-indigo-300 bg-indigo-600 px-3 py-2 font-pixel text-xs uppercase text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex w-full flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
