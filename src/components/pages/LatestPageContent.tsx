'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article } from '@/lib/mock-data';
import { Clock, Calendar } from 'lucide-react';
import { formatArticleDate } from '@/lib/format-date';

interface Props {
    articles: Article[];
}

export function LatestPageContent({ articles }: Props) {
    const t = useTranslations('home');
    const locale = useLocale();

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10">
            <div className="border-b-2 border-vintage-accent pb-3 mb-8">
                <h1 className="font-cinzel text-xl md:text-3xl font-black text-vintage-accent uppercase tracking-wider">
                    {t('latestStories')}
                </h1>
            </div>

            {articles.length === 0 ? (
                <p className="font-serif-vintage text-vintage-text/60 text-base">{t('noPublishedArticles')}</p>
            ) : (
            <div className="space-y-0 divide-y divide-vintage-border">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group block py-6 first:pt-0"
                    >
                        <article className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Image */}
                            <div className="shrink-0 w-full md:w-64 lg:w-80 aspect-[16/10] overflow-hidden border border-vintage-border bg-vintage-panel/20 rounded-none">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col justify-center flex-1">
                                {/* Category */}
                                <span className="text-[10px] font-mono-raw font-extrabold uppercase tracking-widest text-vintage-accent mb-2">
                                    {article.categoryLabel}
                                </span>

                                {/* Title */}
                                <h2 className="font-serif-vintage text-lg md:text-2xl font-bold text-vintage-text group-hover:text-vintage-accent transition-colors duration-200 leading-snug mb-2">
                                    {article.title}
                                </h2>

                                {/* Summary */}
                                <p className="text-xs md:text-sm text-vintage-text/75 line-clamp-2 mb-3 leading-relaxed font-sans-intel text-justify">
                                    {article.summary}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-[10px] font-mono-raw text-vintage-text/60">
                                    <span className="font-bold text-vintage-text">
                                        {article.author}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatArticleDate(article.publishDate, locale)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {t('minRead', { minutes: article.readingMinutes })}
                                    </span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
            )}
        </div>
    );
}
