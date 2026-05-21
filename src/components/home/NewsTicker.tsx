'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getLatestArticles } from '@/lib/mock-data';
import { Clock } from 'lucide-react';

export function NewsTicker() {
    const t = useTranslations('home');
    const articles = getLatestArticles(10);

    return (
        <div className="bg-neutral-900 text-white overflow-hidden">
            <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-10">
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-brand-400 mr-4 pr-4 border-r border-neutral-700">
                        {t('latestStories')}
                    </span>
                    <div className="overflow-hidden flex-1">
                        <div className="ticker-scroll flex items-center gap-8 whitespace-nowrap">
                            {[...articles, ...articles].map((article, i) => (
                                <Link
                                    key={`${article.id}-${i}`}
                                    href={`/article/${article.slug}`}
                                    className="inline-flex items-center gap-3 text-sm text-neutral-300 hover:text-white transition-colors"
                                >
                                    <span className="font-medium">{article.title}</span>
                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                        <Clock className="w-3 h-3" />
                                        {t('minRead', { minutes: article.readingMinutes })}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
