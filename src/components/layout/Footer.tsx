'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface FooterProps {
    year: number;
}

export function Footer({ year }: FooterProps) {
    const t = useTranslations('footer');
    const nav = useTranslations('nav');

    return (
        <footer className="w-full bg-vintage-bg text-vintage-text px-4 md:px-8 max-w-[1440px] mx-auto mt-auto">
            
            {/* Top Border Divider */}
            <div className="double-border-top pt-8 pb-10 border-vintage-accent/40 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Brand / Editor Intro */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 select-none">
                        <img
                            src="/icon.png"
                            alt="AI闹 Logo"
                            className="w-5 h-5 object-contain"
                        />
                        <span className="text-sm font-noto-serif-sc font-black tracking-widest bg-gradient-to-r from-[#252ef7] to-[#fc82e7] bg-clip-text text-transparent">
                            AI NOW ｜ AI闹
                        </span>
                    </div>
                    <p className="text-xs text-vintage-text/75 leading-relaxed font-sans-intel text-justify">
                        {t('aboutText')}
                    </p>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3 font-sans-intel">
                    <h3 className="text-xs font-mono-raw font-bold uppercase tracking-wider text-vintage-accent">
                        {t('links')}
                    </h3>
                    <ul className="grid grid-cols-2 gap-2 text-xs">
                        <li>
                            <Link
                                href="/latest"
                                className="text-vintage-text/70 hover:text-vintage-accent transition-colors font-semibold"
                            >
                                {nav('latest')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/categories"
                                className="text-vintage-text/70 hover:text-vintage-accent transition-colors font-semibold"
                            >
                                {nav('categories')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/about"
                                className="text-vintage-text/70 hover:text-vintage-accent transition-colors font-semibold"
                            >
                                {nav('about')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/newsletter"
                                className="text-vintage-text/70 hover:text-vintage-accent transition-colors font-semibold"
                            >
                                {nav('newsletter')}
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Social Channels & Links */}
                <div className="space-y-3 font-sans-intel">
                    <h3 className="text-xs font-mono-raw font-bold uppercase tracking-wider text-vintage-accent">
                        {t('social')}
                    </h3>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-vintage-text/70">
                        <li>
                            <a
                                href="https://twitter.com/ainow"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-vintage-accent font-semibold transition-colors"
                            >
                                Twitter / X
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://linkedin.com/company/ainow"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-vintage-accent font-semibold transition-colors"
                            >
                                LinkedIn
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom copyright broadsheet bar */}
            <div className="border-t border-vintage-border py-4 flex flex-col md:flex-row items-center justify-between text-[11px] text-vintage-text/50 font-mono-raw tracking-wide gap-2">
                <div>
                    {t('copyright', { year })}
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/about"
                        className="hover:text-vintage-accent transition-colors"
                    >
                        {t('privacy')}
                    </Link>
                    <span>•</span>
                    <Link
                        href="/about"
                        className="hover:text-vintage-accent transition-colors"
                    >
                        {t('terms')}
                    </Link>
                </div>
            </div>
        </footer>
    );
}
