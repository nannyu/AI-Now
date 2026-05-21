import { getDbCategoryCounts } from '@/lib/db-articles';
import { localizedCategories } from '@/lib/article-categories';
import { CategoriesPageContent } from '@/components/pages/CategoriesPageContent';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function CategoriesPage({ params }: Props) {
    const { locale } = await params;
    const dbCounts = getDbCategoryCounts();
    const categoriesWithCount = localizedCategories(locale).map((cat) => ({
        ...cat,
        articleCount: dbCounts[cat.slug] || 0,
    }));

    return <CategoriesPageContent categories={categoriesWithCount} />;
}
