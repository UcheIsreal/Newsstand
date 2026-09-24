import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import CategoryNav from "@/components/CategoryNav";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const googleAnalyticsId = "G-0LYYBLXWVK";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Understand the world in 100 words`,
    template: `%s | ${SITE_NAME}`
  },
  description:
    "Newsstand summarizes major global news into detailed 100-word briefs with source attribution and related coverage.",
  keywords: [
    "100-word news briefs",
    "global news summaries",
    "RSS news aggregator",
    "news briefs",
    "world news summaries",
    "business news briefs",
    "technology news summaries"
  ],
  alternates: {
    canonical: SITE_URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  },
  openGraph: {
    title: `${SITE_NAME} | Understand the world in 100 words`,
    description:
      "Concise global news briefs from trusted publishers, organized by category, topic, and source.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Understand the world in 100 words`,
    description: "Concise source-attributed news briefs from trusted RSS feeds."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {googleAnalyticsId ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]) }}
        />

        {adsenseClient ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}

        <header className="border-b border-black/10 bg-paper">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link href="/" className="font-display text-3xl font-extrabold tracking-normal text-ink">
                Newsstand
              </Link>
              <p className="mt-1 max-w-2xl text-sm text-ink/65">
                Major world news, compressed into useful 100-word briefs with source attribution.
              </p>
            </div>
            <div className="text-sm font-semibold text-ocean">Updated every 30 minutes</div>
          </div>
        </header>

        <CategoryNav />
        {children}

        <footer className="mt-16 border-t border-black/10 bg-ink px-4 py-10 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="font-display text-2xl font-bold">Newsstand</div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                A summary-first news aggregator built for readers who want the signal quickly and still want direct access to the original reporting.
              </p>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-white/50">Pages</div>
              <div className="mt-3 grid gap-2 text-sm text-white/75">
                <Link href="/about">About</Link>
                <Link href="/topics">Topics</Link>
                <Link href="/sources">Sources</Link>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-white/50">Policy</div>
              <div className="mt-3 grid gap-2 text-sm text-white/75">
                <Link href="/editorial-policy">Editorial Policy</Link>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Use</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
