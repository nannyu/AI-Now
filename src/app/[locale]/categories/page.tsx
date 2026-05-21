import { categories, articles } from '@/lib/mock-data';
import { CategoriesPageContent } from '@/components/pages/CategoriesPageContent';

export default function CategoriesPage() {
    const categoriesWithCount = categories.map((cat) => ({
        ...cat,
        articleCount: articles.filter((a) =>
            a.categories.some((c) => c.id === cat.id)
        ).length,
    }));

    return <CategoriesPageContent categories={categoriesWithCount} />;
}
