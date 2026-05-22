import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { editorialFontVariables } from '@/app/fonts';

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} className={editorialFontVariables}>
            <body className="min-h-screen flex flex-col">
                <NextIntlClientProvider messages={messages}>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer year={new Date().getFullYear()} />
                    <ScrollToTop />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
