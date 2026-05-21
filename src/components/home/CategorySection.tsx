'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { articles, categories } from '@/lib/mock-data';
import { ArrowRight, Clock } from 'lucide-react';

export function CategorySection() {
    const t = useTranslations('home');

    // Group articles by category, only show categories with articles
    const categoryGroups = categories
        .map((category) => ({
            category,
            articles: articles
                .filter((a) => a.categories.some((c) => c.id === category.id))
                .sort(
                    (a, b) =>
                        new Date(b.publishDate).getTime() -
                        new Date(a.publishDate).getTime()
                )
                .slice(0, 4),
        }))
        .filter((group) => group.articles.length > 0)
        .slice(0, 4);

    return (
        <section className="space-y-16">
            {categoryGroups.map((group) => (
                <div key={group.category.id}>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-neutral-900">
                            {group.category.name}
                        </h2>
                        <Link
                            href={`/category/${group.category.slug}`}
                            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                        >
                            {t('viewAll')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Articles grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {group.articles.map((article, index) => (
                            <Link
                                key={article.id}
                                href={`/article/${article.slug}`}
                                className="group"
                            >
                                <article
                                    className={
                                        index === 0
                                            ? 'md:col-span-2 lg:col-span-2 lg:row-span-2'
                                            : ''
                                    }
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-3">
                                        <img
                                            src={article.coverImage}
                                            alt={article.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h3 className="text-base font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1.5">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                                            <span>{article.author}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {t('minRead', { minutes: article.readingMinutes })}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
