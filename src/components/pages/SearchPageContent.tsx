'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article } from '@/lib/mock-data';
import { Search, Clock, Calendar } from 'lucide-react';
import { formatArticleDate } from '@/lib/format-date';

interface Props {
    articles: Article[];
}

export function SearchPageContent({ articles }: Props) {
    const t = useTranslations('search');
    const home = useTranslations('home');
    const locale = useLocale();
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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10 bg-vintage-bg">
            {/* Search input */}
            <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vintage-text/45" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('placeholder')}
                        autoFocus
                        className="w-full pl-12 pr-4 py-3 bg-vintage-bg border border-vintage-border focus:outline-none focus:border-vintage-accent text-base rounded-none text-vintage-text placeholder-vintage-text/40 font-serif-vintage"
                    />
                </div>

                {query.length >= 2 && (
                    <p className="mt-4 text-[10px] font-mono-raw text-vintage-text/60 uppercase tracking-wider">
                        {t('results', { count: results.length, query })}
                    </p>
                )}
            </div>

            {/* Results */}
            {query.length >= 2 && results.length === 0 && (
                <div className="text-center py-16">
                    <p className="font-serif-vintage text-vintage-text/60 text-base">{t('noResults')}</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-0 divide-y divide-vintage-border max-w-3xl mx-auto">
                    {results.map((article) => (
                        <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group block py-6 first:pt-0"
                        >
                            <article>
                                <span className="text-[9px] font-mono-raw font-extrabold uppercase tracking-widest text-vintage-accent mb-1.5 block">
                                    {article.categoryLabel}
                                </span>
                                <h2 className="font-serif-vintage text-base md:text-lg font-bold text-vintage-text group-hover:text-vintage-accent transition-colors duration-200 mt-1 mb-1.5 leading-snug">
                                    {article.title}
                                </h2>
                                <p className="text-xs text-vintage-text/75 line-clamp-2 mb-2.5 font-sans-intel text-justify">
                                    {article.summary}
                                </p>
                                <div className="flex items-center gap-4 text-[10px] font-mono-raw text-vintage-text/60">
                                    <span className="font-bold text-vintage-text">{article.author}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatArticleDate(article.publishDate, locale)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
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
