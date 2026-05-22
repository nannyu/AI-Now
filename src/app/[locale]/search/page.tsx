import { getAllPublishedDbArticles } from '@/lib/db-articles';
import { SearchPageContent } from '@/components/pages/SearchPageContent';

export default async function SearchPage() {
    return <SearchPageContent articles={await getAllPublishedDbArticles()} />;
}
