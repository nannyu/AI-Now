'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getLatestArticles } from '@/lib/mock-data';
import { formatArticleDate } from '@/lib/format-date';
import { Clock } from 'lucide-react';

export function LatestStoriesSidebar() {
    const t = useTranslations('home');
    const locale = useLocale();
    const articles = getLatestArticles(8).slice(2);

    return (
        <aside className="hidden lg:block">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4 pb-3 border-b border-neutral-200">
                {t('latestStories')}
            </h3>

            <div className="space-y-0 divide-y divide-neutral-100">
                {articles.map((article, index) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group block py-4 first:pt-0"
                    >
                        <div className="flex gap-3">
                            {/* Number */}
                            <span className="shrink-0 text-2xl font-bold text-neutral-200 tabular-nums">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            <div>
                                <h4 className="text-sm font-medium text-neutral-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                                    {article.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                    <span>{formatArticleDate(article.publishDate, locale)}</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {t('minRead', { minutes: article.readingMinutes })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    );
}
