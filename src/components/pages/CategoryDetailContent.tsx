'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article, Category } from '@/lib/mock-data';
import { Clock, Calendar, ChevronRight } from 'lucide-react';
import { formatArticleDate } from '@/lib/format-date';

interface Props {
    category: Category;
    articles: Article[];
}

export function CategoryDetailContent({ category, articles }: Props) {
    const t = useTranslations('category');
    const home = useTranslations('home');
    const locale = useLocale();

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] font-sans-intel text-vintage-text/60 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-vintage-accent transition-colors">
                    {locale === 'zh' ? '首页' : 'Home'}
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link
                    href="/categories"
                    className="hover:text-vintage-accent transition-colors"
                >
                    {t('allCategories')}
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-vintage-text font-bold">{category.name}</span>
            </nav>

            <div className="border-b-2 border-vintage-accent pb-3 mb-8">
                <h1 className="font-cinzel text-xl md:text-3xl font-black text-vintage-accent uppercase tracking-wider">
                    {category.name}
                </h1>
            </div>

            {articles.length === 0 ? (
                <p className="font-serif-vintage text-vintage-text/60 text-base">{t('noArticles')}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group flex flex-col p-4 border border-vintage-border bg-vintage-bg hover:bg-vintage-panel/20 transition-all duration-300 rounded-none justify-between h-full focus:outline-none"
                        >
                            <div>
                                <div className="w-full aspect-[16/10] overflow-hidden rounded-none border border-vintage-border/30 mb-3.5">
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                    />
                                </div>

                                <span className="text-[9px] font-mono-raw font-extrabold uppercase tracking-widest text-vintage-accent/70 block mb-1">
                                    {article.categoryLabel}
                                </span>

                                <h2 className="font-serif-vintage text-base font-bold text-vintage-text group-hover:text-vintage-accent transition-colors duration-200 line-clamp-2 leading-snug mb-2">
                                    {article.title}
                                </h2>

                                <p className="text-[11px] text-vintage-text/75 line-clamp-3 leading-relaxed mb-4 font-sans-intel text-justify">
                                    {article.summary}
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-vintage-border/40 pt-2 text-[10px] text-vintage-text/60 font-mono-raw">
                                <span>{article.author}</span>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatArticleDate(article.publishDate, locale)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {home('minRead', { minutes: article.readingMinutes })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
