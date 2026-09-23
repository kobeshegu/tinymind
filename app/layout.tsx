import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { SessionProvider } from "../components/SessionProvider";
import Script from "next/script";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const SITE_ICON = "/icon.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const title = `${SITE_NAME} | Research & Writing`;
  const description =
    "Research, essays, and field notes on multimodal learning and generative models.";

  const baseUrl = SITE_URL;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    manifest: "/manifest.json",
    // These were in a next/head block, which is a no-op in the App Router, so
    // they never reached the HTML. viewport-fit is deliberately not restored:
    // it would change the mobile layout, which is a visual change, not a fix.
    icons: {
      icon: SITE_ICON,
      apple: "/icon-144.jpg",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: SITE_NAME,
      images: [{ url: SITE_ICON, width: 512, height: 512, alt: SITE_NAME }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_ICON],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-1MF16MH92D"
      />
      <Script id="google-analytics">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-1MF16MH92D');
      `}</Script>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <Header />
            <main className="site-main">{children}</main>
            <Footer />
            <Toaster />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
