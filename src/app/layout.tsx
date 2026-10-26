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
    title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.description,
    openGraph: { siteName: site.name, type: "website", locale: "en_IN" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
