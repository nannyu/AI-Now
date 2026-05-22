import { getDbArticleBySlug, getRelatedDbArticles } from '@/lib/db-articles';
import { getSession } from '@/lib/auth';
import { ArticleContent } from '@/components/article/ArticleContent';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = await getDbArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    if (article.dbStatus !== 'published') {
        const session = await getSession();
        if (!session) {
            notFound();
        }
    }

    const related = await getRelatedDbArticles(article, 4);

    return (
        <div className="bg-vintage-bg">
            <ArticleContent article={article} />
            <RelatedArticles articles={related} />
        </div>
    );
}
