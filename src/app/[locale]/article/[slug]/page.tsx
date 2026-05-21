import { articles, getRelatedArticles } from '@/lib/mock-data';
import { ArticleContent } from '@/components/article/ArticleContent';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
        notFound();
    }

    const related = getRelatedArticles(article, 4);

    return (
        <>
            <ArticleContent article={article} />
            <RelatedArticles articles={related} />
        </>
    );
}
