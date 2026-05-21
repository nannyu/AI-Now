'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getFeaturedArticle } from '@/lib/mock-data';
import { ArrowRight, Clock } from 'lucide-react';

export function FeaturedArticle() {
    const t = useTranslations('home');
    const article = getFeaturedArticle();

    return (
        <section className="relative">
            <Link href={`/article/${article.slug}`} className="group block">
                <div className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden rounded-2xl">
                    {/* Background image */}
                    <img
                        src={article.coverImage}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                        {/* Category badge */}
                        <div className="flex items-center gap-2 mb-3">
                            {article.categories.slice(0, 1).map((cat) => (
                                <span
                                    key={cat.id}
                                    className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-brand-600 text-white rounded-full"
                                >
                                    {cat.name}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 max-w-4xl text-balance">
                            {article.title}
                        </h2>

                        {/* Summary */}
                        <p className="text-base md:text-lg text-neutral-200 max-w-2xl mb-4 line-clamp-2">
                            {article.summary}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-neutral-300">
                            <span className="font-medium">{article.author}</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {t('minRead', { minutes: article.readingMinutes })}
                            </span>
                            <span className="inline-flex items-center gap-1 text-brand-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                {t('readMore')}
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </section>
    );
}
