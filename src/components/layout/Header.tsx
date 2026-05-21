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
        { code: 'en', label: 'EN' },
        { code: 'zh', label: 'ZH' },
        { code: 'de', label: 'DE' },
    ];

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
        setLangMenuOpen(false);
    };

    return (
        <header className="w-full bg-vintage-bg text-vintage-text px-4 md:px-8 max-w-[1440px] mx-auto pt-4">
            
            {/* Top Brand Logo Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-vintage-border/40">
                
                {/* Left placeholder for symmetry on desktop */}
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono-raw text-vintage-accent/65 tracking-widest uppercase font-bold">
                    EST. 2025 • BEIJING
                </div>

                {/* Main Logo Branding */}
                <div className="text-center flex-1">
                    <Link href="/" className="inline-block group focus:outline-none">
                        <h1 className="text-3xl md:text-5xl font-cinzel tracking-tight font-black text-vintage-text mt-1 transition-colors duration-300 group-hover:text-vintage-accent">
                            AI NOW <span className="font-serif-vintage tracking-normal italic text-vintage-accent font-normal">｜ AI闹</span>
                        </h1>
                    </Link>
                </div>

                {/* Right side quick tools (desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Search link */}
                    <Link
                        href="/search"
                        className="p-1.5 hover:text-vintage-accent transition-colors focus:outline-none"
                        aria-label={t('search')}
                    >
                        <Search className="w-4 h-4" />
                    </Link>

                    {/* Admin Dashboard */}
                    <a
                        href="/admin"
                        className="p-1.5 hover:text-vintage-accent transition-colors focus:outline-none text-vintage-text/60"
                        aria-label="Admin"
                        title="Admin"
                    >
                        <Settings className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Classical Newspaper Double Border Nav Bar */}
            <div className="double-border-bottom py-2 mt-1 border-t border-vintage-accent/40 flex items-center justify-between text-[11px] text-vintage-accent font-mono-raw tracking-wider uppercase font-semibold gap-2">
                
                {/* Subtitle / Pipeline Branding */}
                <div className="text-[9px] md:text-[11px] font-bold text-vintage-accent/80 tracking-wide font-sans-intel">
                    STORIES OF CHINESE AI ENTREPRENEURS, FOR THE WORLD
                </div>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 font-sans-intel">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                'transition-colors hover:text-vintage-text border-b-2 py-0.5 tracking-widest text-xs font-bold',
                                pathname === link.href
                                    ? 'border-vintage-accent text-vintage-text'
                                    : 'border-transparent text-vintage-accent/70'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Language Switcher & Mobile Menu Button */}
                <div className="flex items-center gap-2">
                    {/* Language Switcher Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            className="flex items-center gap-1 bg-vintage-panel border border-vintage-border-dark/60 px-2 py-1 rounded text-[10px] font-mono-raw hover:bg-vintage-border/30 hover:border-vintage-accent transition-all font-bold focus:outline-none"
                            aria-label="Switch language"
                        >
                            <Globe className="w-3 h-3 text-vintage-accent" />
                            <span>{locale.toUpperCase()}</span>
                        </button>

                        {langMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setLangMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1.5 w-24 bg-vintage-bg border border-vintage-border shadow-md rounded-sm py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {locales.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => switchLocale(l.code)}
                                            className={clsx(
                                                'w-full text-left px-3 py-1.5 font-mono-raw text-xs transition-colors focus:outline-none',
                                                locale === l.code
                                                    ? 'text-vintage-accent bg-vintage-panel font-extrabold'
                                                    : 'text-vintage-text/70 hover:bg-vintage-panel hover:text-vintage-accent'
                                            )}
                                        >
                                            {l.code.toUpperCase()} ({l.label})
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Icon */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-1 hover:text-vintage-accent text-vintage-text focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-vintage-border bg-vintage-panel py-3 px-4 mt-1 animate-in slide-in-from-top duration-300 font-sans-intel">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={clsx(
                                    'px-3 py-2 rounded text-sm font-bold tracking-wider transition-colors',
                                    pathname === link.href
                                        ? 'bg-vintage-accent text-vintage-bg'
                                        : 'text-vintage-text hover:bg-vintage-border/20'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <hr className="border-vintage-border/50 my-1" />
                        <div className="flex gap-4 px-3 pt-2 text-xs text-vintage-text/60">
                            <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="hover:text-vintage-accent flex items-center gap-1 font-bold">
                                <Search className="w-3.5 h-3.5" /> {t('search')}
                            </Link>
                            <a href="/admin" className="hover:text-vintage-accent flex items-center gap-1 font-bold">
                                <Settings className="w-3.5 h-3.5" /> Admin
                            </a>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
