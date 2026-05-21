import { getLatestArticles } from '@/lib/mock-data';
import { LatestPageContent } from '@/components/pages/LatestPageContent';

export default function LatestPage() {
    const articles = getLatestArticles(10);
    return <LatestPageContent articles={articles} />;
}
