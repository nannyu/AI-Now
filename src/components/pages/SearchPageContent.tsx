'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { articles } from '@/lib/mock-data';
import { Search, Clock } from 'lucide-react';

export function SearchPageContent() {
    const t = useTranslations('search');
    const home = useTranslations('home');
    const [query, setQuery] = useState('');

    const results =
        query.length >= 2
            ? articles.filter(
                (a) =>
                    a.title.toLowerCase().includes(query.toLowerCase()) ||
                    a.summary.toLowerCase().includes(query.toLowerCase())
            )
            : [];

    return (
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            {/* Search input */}
            <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('placeholder')}
                        autoFocus
                        className="w-full pl-12 pr-4 py-4 text-lg border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                </div>

                {query.length >= 2 && (
                    <p className="mt-4 text-sm text-neutral-500">
                        {t('results', { count: results.length, query })}
                    </p>
                )}
            </div>

            {/* Results */}
            {query.length >= 2 && results.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-lg text-neutral-500">{t('noResults')}</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-0 divide-y divide-neutral-200 max-w-3xl mx-auto">
                    {results.map((article) => (
                        <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group block py-6 first:pt-0"
                        >
                            <article>
                                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                                    {article.categories[0]?.name}
                                </span>
                                <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors mt-1 mb-1">
                                    {article.title}
                                </h2>
                                <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                                    {article.summary}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                                    <span>{article.author}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {home('minRead', { minutes: article.readingMinutes })}
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
