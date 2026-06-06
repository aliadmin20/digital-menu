// app/[locale]/layout.jsx
// Server Component — no "use client".
// Provides locale context to the entire subtree via NextIntlClientProvider.
// setRequestLocale() is called before any next-intl API so that all Server
// Components in this subtree can read the locale statically — no dynamic
// rendering, no x-next-intl-locale header, no Cache-Control: no-store.
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "../../i18n";
import "../globals.css";

export const metadata = {
    title: "Jiggly Cake",
    description: "Jiggly Cake — Japanese cheesecake, soft as silk.",
    icons: {
        icon: [
            { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon_io/favicon.ico", type: "image/x-icon" },
        ],
        apple: [
            { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    openGraph: {
        title: "Jiggly Cake",
        description: "Jiggly Cake — Japanese cheesecake, soft as silk.",
        url: "https://digital-menu-swart.vercel.app",
        siteName: "Jiggly Cake",
        images: [
            {
                url: "https://digital-menu-swart.vercel.app/assets/logo.jpg",
                width: 1200,
                height: 630,
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Jiggly Cake",
        description: "Jiggly Cake — Japanese cheesecake, soft as silk.",
        images: ["https://digital-menu-swart.vercel.app/assets/logo.jpg"],
    },
};

// Pre-generate all locale routes at build time.
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
    const { locale } = await params;

    if (!locales.includes(locale)) notFound();

    // Must be called before any next-intl API (getMessages, useTranslations, etc.)
    // This writes the locale into a request-scoped cache so all Server Components
    // in this subtree read it statically — avoiding the x-next-intl-locale header
    // that would otherwise force dynamic rendering and break Vercel CDN caching.
    setRequestLocale(locale);

    const messages = await getMessages();
    const isRtl = locale === "ar" || locale === "ckb";

    return (
        <html
            lang={locale}
            dir={isRtl ? "rtl" : "ltr"}
            data-scroll-behavior="smooth"
        >
            <body>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}