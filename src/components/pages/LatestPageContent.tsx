'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article } from '@/lib/mock-data';
import { Clock, Calendar } from 'lucide-react';

interface Props {
    articles: Article[];
}

export function LatestPageContent({ articles }: Props) {
    const t = useTranslations('home');

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-10">
                {t('latestStories')}
            </h1>

            <div className="space-y-0 divide-y divide-neutral-200">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group block py-8 first:pt-0"
                    >
                        <article className="flex flex-col md:flex-row gap-6">
                            {/* Image */}
                            <div className="shrink-0 w-full md:w-64 lg:w-80 aspect-[16/9] md:aspect-[4/3] rounded-xl overflow-hidden">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col justify-center">
                                {/* Category */}
                                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
                                    {article.categories[0]?.name}
                                </span>

                                {/* Title */}
                                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 group-hover:text-brand-600 transition-colors mb-2">
                                    {article.title}
                                </h2>

                                {/* Summary */}
                                <p className="text-base text-neutral-600 line-clamp-2 mb-3">
                                    {article.summary}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                    <span className="font-medium text-neutral-700">
                                        {article.author}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(article.publishDate)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {t('minRead', { minutes: article.readingMinutes })}
                                    </span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </div>
    );
}
