'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article } from '@/lib/mock-data';
import { Clock } from 'lucide-react';

interface Props {
    articles: Article[];
}

export function RelatedArticles({ articles }: Props) {
    const t = useTranslations('article');
    const home = useTranslations('home');

    if (articles.length === 0) return null;

    return (
        <section className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-8 border-t border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">
                {t('relatedStories')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group"
                    >
                        <article>
                            {/* Image */}
                            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Category */}
                            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                                {article.categories[0]?.name}
                            </span>

                            {/* Title */}
                            <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors line-clamp-2 mt-1 mb-2">
                                {article.title}
                            </h3>

                            {/* Meta */}
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <span>{article.author}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {home('minRead', { minutes: article.readingMinutes })}
                                </span>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
}
