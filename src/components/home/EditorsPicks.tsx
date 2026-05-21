'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getLatestArticles } from '@/lib/mock-data';
import { Clock } from 'lucide-react';

export function EditorsPicks() {
    const t = useTranslations('home');
    const picks = getLatestArticles(6).slice(1, 5);

    return (
        <section>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-6">
                {t('editorPicks')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {picks.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group flex gap-4 p-4 rounded-xl border border-neutral-200 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
                    >
                        {/* Thumbnail */}
                        <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden">
                            <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-center min-w-0">
                            {/* Category */}
                            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
                                {article.categories[0]?.name}
                            </span>

                            {/* Title */}
                            <h3 className="text-sm md:text-base font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors line-clamp-2 mb-2">
                                {article.title}
                            </h3>

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                                <span>{article.author}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {t('minRead', { minutes: article.readingMinutes })}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
