'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Footer() {
    const t = useTranslations('footer');
    const nav = useTranslations('nav');

    return (
        <footer className="bg-neutral-900 text-neutral-300">
            <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand & Description */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AI</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                Now
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            {t('aboutText')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            {t('links')}
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/latest"
                                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    {nav('latest')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    {nav('categories')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    {nav('about')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/newsletter"
                                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    {nav('newsletter')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            {t('social')}
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://twitter.com/ainow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    Twitter / X
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://linkedin.com/company/ainow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/api/feed/en"
                                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    RSS Feed
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-neutral-500">
                        {t('copyright', { year: new Date().getFullYear() })}
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/about"
                            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                            {t('privacy')}
                        </Link>
                        <Link
                            href="/about"
                            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                            {t('terms')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
