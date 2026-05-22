export const ARTICLE_STATUSES = ['draft', 'published', 'rejected', 'trash'] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export function isArticleStatus(value: string): value is ArticleStatus {
    return (ARTICLE_STATUSES as readonly string[]).includes(value);
}
