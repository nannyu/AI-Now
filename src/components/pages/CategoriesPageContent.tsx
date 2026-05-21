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
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-10">
                {t('allCategories')}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="group flex items-center justify-between p-6 rounded-xl border border-neutral-200 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
                    >
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors">
                                {category.name}
                            </h2>
                            <p className="text-sm text-neutral-500 mt-1">
                                {category.articleCount} articles
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
