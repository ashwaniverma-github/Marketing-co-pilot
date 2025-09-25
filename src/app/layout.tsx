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
  metadataBase: new URL('https://indiegrowth.app'),
  title: {
    default: "Indiegrowth - Your App's Growth Co-Pilot",
    template: "%s | Indiegrowth"
  },
  description: "Just Give Us The Url Of Your App And We Will Handle The rest , from content to growth",
  keywords: ["app growth", "startup", "product analytics", "growth hacking"],
  authors: [{ name: "Indiegrowth Team" }],
  creator: "ashwani",
  publisher: "Indiegrowth",
  verification: {
    google: 'yiYpoh2nQF0BXHgGHh-CdOyIivMuK4kZtHZn7hf0TDs'
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      // { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      // { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    // apple: [
    //   { url: '/apple-touch-icon.png' }
    // ]
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE,
    title: "Indiegrowth - Your App's Growth Co-Pilot",
    description: "Just Give Us The Url Of Your App And We Will Handle The rest , from content to growth",
    siteName: "Indiegrowth",
    images: [
      {
        url: `${SITE}/social-preview.png`,
        width: 1200,
        height: 630,
        alt: 'Indiegrowth - Your App\'s Growth Co-Pilot',
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Indiegrowth - Your App's Growth Co-Pilot",
    description: "Just Give Us The Url Of Your App And We Will Handle The rest , from content to growth",
    creator: "@indiegrowth",
    images: [`${SITE}/social-preview.png`]
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
