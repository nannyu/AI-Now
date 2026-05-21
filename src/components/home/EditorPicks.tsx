'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Article } from '@/lib/mock-data';

interface EditorPicksProps {
    articles: Article[];
}

export function EditorPicks({ articles }: EditorPicksProps) {
    const t = useTranslations('home');
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 340;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <section className="py-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">{t('editorPicks')}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
            >
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group shrink-0 w-[300px] sm:w-[340px] snap-start"
                    >
                        <div className="card h-full">
                            <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    {article.categories.slice(0, 1).map((cat) => (
                                        <span key={cat.id} className="tag text-[11px]">
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="font-heading text-body font-semibold text-neutral-900 line-clamp-2 group-hover:text-brand-700 transition-colors mb-3">
                                    {article.title}
                                </h3>
                                <div className="flex items-center gap-2 text-caption text-neutral-500">
                                    <span className="font-medium text-neutral-600">{article.author}</span>
                                    <span>•</span>
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
        </section>
    );
}
