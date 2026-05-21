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
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8 double-border-top border-vintage-accent/30">
            <h2 className="font-cinzel text-sm tracking-widest font-black text-vintage-accent uppercase mb-6">
                {t('relatedStories')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group flex flex-col p-3 border border-vintage-border bg-vintage-bg hover:bg-vintage-panel/20 transition-all duration-300 rounded-sm focus:outline-none justify-between"
                    >
                        <div>
                            {/* Image */}
                            <div className="aspect-[16/10] overflow-hidden border border-vintage-border/30 rounded-sm mb-3">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                />
                            </div>

                            {/* Category */}
                            <span className="text-[9px] font-mono-raw font-extrabold uppercase tracking-wider text-vintage-accent/70 block mb-1">
                                {article.categoryLabel || article.categories[0]?.name}
                            </span>

                            {/* Title */}
                            <h3 className="font-serif-vintage text-sm font-bold text-vintage-text group-hover:text-vintage-accent transition-colors line-clamp-2 leading-snug mb-2">
                                {article.title}
                            </h3>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between border-t border-vintage-border/40 pt-2 text-[10px] text-vintage-text/60 font-mono-raw">
                            <span>{article.author}</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {home('minRead', { minutes: article.readingMinutes })}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
