'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

interface CategoryWithCount {
    id: string;
    name: string;
    slug: string;
    articleCount: number;
}

interface Props {
    categories: CategoryWithCount[];
}

export function CategoriesPageContent({ categories }: Props) {
    const t = useTranslations('category');

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10">
            <div className="border-b-2 border-vintage-accent pb-3 mb-8">
                <h1 className="font-cinzel text-xl md:text-3xl font-black text-vintage-accent uppercase tracking-wider">
                    {t('allCategories')}
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="group flex items-center justify-between p-6 rounded-none border border-vintage-border bg-vintage-bg hover:bg-vintage-panel/20 transition-all duration-300"
                    >
                        <div>
                            <h2 className="font-serif-vintage text-base font-bold text-vintage-text group-hover:text-vintage-accent transition-colors leading-tight">
                                {category.name}
                            </h2>
                            <p className="font-mono-raw text-[10px] text-vintage-text/60 mt-1 uppercase">
                                {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
                            </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-vintage-text/40 group-hover:text-vintage-accent transition-colors duration-200" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
