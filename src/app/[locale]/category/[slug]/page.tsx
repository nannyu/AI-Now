import { categories, getArticlesByCategory } from '@/lib/mock-data';
import { CategoryDetailContent } from '@/components/pages/CategoryDetailContent';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const category = categories.find((c) => c.slug === slug);

    if (!category) {
        notFound();
    }

    const articles = getArticlesByCategory(slug);

    return <CategoryDetailContent category={category} articles={articles} />;
}
