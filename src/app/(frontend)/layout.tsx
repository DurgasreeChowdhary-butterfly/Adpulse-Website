import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    metadataBase: new URL(site.url),
    title: { default: site.seo.title, template: `%s | ${site.name}` },
    description: site.seo.description,
    // Without a CMS favicon, Next.js serves app/icon.png + app/favicon.ico.
    icons: site.favicon ? { icon: site.favicon.url, apple: site.favicon.url } : undefined,
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: "en_IN",
      images: site.seo.image ? [{ url: site.seo.image.url, alt: site.seo.image.alt }] : undefined,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
