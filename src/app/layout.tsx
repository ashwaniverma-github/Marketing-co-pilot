import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const SITE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://indiegrowth.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Write tweets that grows your brand",
    template: "%s | Indiegrowth"
  },
  description: "Just give the url of your app and write tweets that grows your app",
  keywords: ["app growth", "startup", "tweet writer", "growth hacking"],
  authors: [{ name: "Indiegrowth Team" }],
  creator: "ashwani",
  publisher: "Indiegrowth",
  verification: {
    google: 'yiYpoh2nQF0BXHgGHh-CdOyIivMuK4kZtHZn7hf0TDs'
  },
  icons: {
    icon: [
      { url: '/indiegrowthNew.png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE,
    title: "Write tweets that grows your brand",
    description: "Just give the url of your app and write tweets that grows your app",
    siteName: "Indiegrowth",
    images: [
      {
        // absolute URL + cache-bust query string
        url: `${SITE}/social-preview.png?v=2`,
        width: 1200,
        height: 630,
        alt: "Indiegrowth - Write tweets that grows your brand",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Write tweets that grows your brand",
    description: "Just give the url of your app and write tweets that grows your app",
    creator: "@indiegrowth",
    // explicit absolute URL with query string to force refetch
    images: [`${SITE}/social-preview.png?v=2`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Optional: explicit meta tags as a Twitter fallback */}
      <head>
        <meta name="twitter:image" content={`${SITE}/social-preview.png?v=2`} />
        <meta name="twitter:image:src" content={`${SITE}/social-preview.png?v=2`} />
        <meta property="og:image" content={`${SITE}/social-preview.png?v=2`} />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
