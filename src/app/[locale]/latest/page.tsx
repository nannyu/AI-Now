import { getLatestDbArticles } from '@/lib/db-articles';
import { LatestPageContent } from '@/components/pages/LatestPageContent';

export default async function LatestPage() {
    return <LatestPageContent articles={getLatestDbArticles(20)} />;
}
