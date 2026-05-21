'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Menu, X, Search, Globe, Settings } from 'lucide-react';
import clsx from 'clsx';

export function Header() {
    const t = useTranslations('nav');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/latest', label: t('latest') },
        { href: '/categories', label: t('categories') },
        { href: '/about', label: t('about') },
        { href: '/newsletter', label: t('newsletter') },
    ];

    const locales = [
        { code: 'en', label: 'English' },
        { code: 'zh', label: '中文' },
        { code: 'de', label: 'Deutsch' },
    ];

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
        setLangMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
            {/* Top bar */}
            <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <span className="text-xl font-bold text-neutral-900 tracking-tight">
                            Now
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    'text-sm font-medium transition-colors hover:text-brand-600',
                                    pathname === link.href
                                        ? 'text-brand-600'
                                        : 'text-neutral-600'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <Link
                            href="/search"
                            className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                            aria-label={t('search')}
                        >
                            <Search className="w-5 h-5" />
                        </Link>

                        {/* Admin */}
                        <a
                            href="/admin"
                            className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors"
                            aria-label="Admin"
                            title="Admin"
                        >
                            <Settings className="w-4 h-4" />
                        </a>

                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setLangMenuOpen(!langMenuOpen)}
                                className="flex items-center gap-1.5 p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                                aria-label="Switch language"
                            >
                                <Globe className="w-5 h-5" />
                                <span className="hidden sm:inline text-xs font-medium uppercase">
                                    {locale}
                                </span>
                            </button>

                            {langMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setLangMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                                        {locales.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => switchLocale(l.code)}
                                                className={clsx(
                                                    'w-full text-left px-4 py-2 text-sm transition-colors',
                                                    locale === l.code
                                                        ? 'text-brand-600 bg-brand-50 font-medium'
                                                        : 'text-neutral-700 hover:bg-neutral-50'
                                                )}
                                            >
                                                {l.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-neutral-500 hover:text-neutral-900"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-neutral-200 bg-white">
                    <nav className="px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={clsx(
                                    'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                    pathname === link.href
                                        ? 'text-brand-600 bg-brand-50'
                                        : 'text-neutral-700 hover:bg-neutral-50'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
