'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article, Category } from '@/lib/mock-data';
import { Clock, Calendar, ChevronRight } from 'lucide-react';

interface Props {
    category: Category;
    articles: Article[];
}

export function CategoryDetailContent({ category, articles }: Props) {
    const t = useTranslations('category');
    const home = useTranslations('home');

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
                <Link href="/" className="hover:text-brand-600 transition-colors">
                    Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                    href="/categories"
                    className="hover:text-brand-600 transition-colors"
                >
                    {t('allCategories')}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-neutral-900 font-medium">{category.name}</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-10">
                {category.name}
            </h1>

            {articles.length === 0 ? (
                <p className="text-neutral-500 text-lg">{t('noArticles')}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group"
                        >
                            <article>
                                <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4">
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                                    {article.title}
                                </h2>

                                <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                                    {article.summary}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-700">
                                        {article.author}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(article.publishDate)}
                                    </span>
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
