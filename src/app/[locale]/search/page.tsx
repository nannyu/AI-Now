import { getAllPublishedDbArticles } from '@/lib/db-articles';
import { SearchPageContent } from '@/components/pages/SearchPageContent';

export default function SearchPage() {
    return <SearchPageContent articles={getAllPublishedDbArticles()} />;
}
