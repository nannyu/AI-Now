import { getDbArticlesByCategory } from '@/lib/db-articles';
import { categoryFromValue, localizedCategories } from '@/lib/article-categories';
import { CategoryDetailContent } from '@/components/pages/CategoryDetailContent';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
    const { slug, locale } = await params;
    const categories = localizedCategories(locale);
    const resolvedCategory = categoryFromValue(slug);
    const category = categories.find((c) => c.slug === resolvedCategory.slug);

    if (!category) {
        notFound();
    }

    return (
        <CategoryDetailContent
            category={category}
            articles={getDbArticlesByCategory(slug)}
        />
    );
}
