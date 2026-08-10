import type { Metadata } from "next";
import { gowun_wodum } from "@/components/ui/font";
import "./globals.css";
import Header from "@/components/Header";
import { SessionProvider } from "../components/SessionProvider";
import Script from "next/script";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import CreateButton from "@/components/CreateButton";

const SITE_ICON = "/icon.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  const title =
    t("title") ||
    "TinyMind - Write and sync your blog posts & thoughts with one-click GitHub sign-in";
  const description =
    t("description") ||
    "Write and preserve your blogs, thoughts, and notes effortlessly. Sign in with GitHub to automatically sync your content to your own repository, ensuring your ideas are safely stored as long as GitHub exists.";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tinymind.me";

  return {
    title,
    description,
    manifest: "/manifest.json",
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "TinyMind",
      images: [{ url: SITE_ICON, width: 512, height: 512, alt: "App Logo" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_ICON],
      site: "@tinymind",
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
    <html lang={locale}>
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
      <body className={gowun_wodum.className}>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <Header />
            <main className="pt-20 pb-20">{children}</main>
            <Footer />
            <CreateButton messages={messages} />
            <Toaster />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
