import { getDb } from './db';
import { isPostgresEnabled, pgQuery } from './postgres';
import { estimateReadingTime } from './content-converter';
import { proxyWechatImages, publicImageProxyUrl } from './image-proxy';
import { normalizeEscapedWhitespace, normalizeInlineWhitespace } from './text-normalize';
import { categoryFromValue, DEFAULT_CATEGORY_SLUG } from './article-categories';
import { sanitizeArticleHtml } from './html-sanitizer';
import type { Article } from './mock-data';

type DbArticleRow = {
    id: number;
    slug: string | null;
    title: string;
    summary: string;
    body: string;
    author: string;
    cover_image: string;
    category: string;
    status: string;
    is_featured: number;
    publish_date: string | null;
    crawled_at: string;
    updated_at: string;
};

export type DbArticle = Article & {
    dbStatus: string;
};

export function dbArticleSlug(id: number | string) {
    return `db-${id}`;
}

function idFromSlug(slug: string) {
    const match = slug.match(/^db-(\d+)$/);
    if (match) return Number(match[1]);
    if (/^\d+$/.test(slug)) return Number(slug);
    return null;
}

function stripHtml(html: string) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeStoredBody(body: string) {
    const normalized = normalizeEscapedWhitespace(body);
    if (!normalized) return '';
    if (/<\/?[a-z][\s\S]*>/i.test(normalized)) {
        return sanitizeArticleHtml(normalized);
    }
    return normalized;
}

export function dbRowToArticle(row: DbArticleRow): DbArticle {
    const category = categoryFromValue(normalizeInlineWhitespace(row.category));
    const body = proxyWechatImages(sanitizeStoredBody(row.body));
    const summary = normalizeInlineWhitespace(row.summary);
    const bodyText = stripHtml(body);
    const publishDate = row.publish_date || row.crawled_at || row.updated_at || '';
    const slug = row.slug || dbArticleSlug(row.id);

    return {
        id: `db-${row.id}`,
        slug,
        title: normalizeInlineWhitespace(row.title),
        subtitle: summary,
        summary,
        body,
        author: normalizeInlineWhitespace(row.author) || 'AI Roar',
        categoryLabel: category.name,
        publishDate,
        readingMinutes: estimateReadingTime(bodyText || row.body),
        coverImage: publicImageProxyUrl(row.cover_image),
        categories: [category],
        isFeatured: row.is_featured === 1,
        dbStatus: row.status,
    };
}

export async function getDbArticleBySlug(slug: string): Promise<DbArticle | undefined> {
    const id = idFromSlug(slug);
    if (isPostgresEnabled()) {
        const { rows } = id
            ? await pgQuery<DbArticleRow>('SELECT * FROM articles WHERE id = $1', [id])
            : await pgQuery<DbArticleRow>('SELECT * FROM articles WHERE slug = $1', [slug]);
        return rows[0] ? dbRowToArticle(rows[0]) : undefined;
    }

    const row = id
        ? getDb().prepare('SELECT * FROM articles WHERE id = ?').get(id) as DbArticleRow | undefined
        : getDb().prepare('SELECT * FROM articles WHERE slug = ?').get(slug) as DbArticleRow | undefined;
    return row ? dbRowToArticle(row) : undefined;
}

export async function getPublishedDbArticles(limit = 20): Promise<DbArticle[]> {
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<DbArticleRow>(
            `
                SELECT *
                FROM articles
                WHERE status = 'published'
                ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
                LIMIT $1
            `,
            [limit]
        );
        return rows.map(dbRowToArticle);
    }

    const rows = getDb()
        .prepare(`
            SELECT *
            FROM articles
            WHERE status = 'published'
            ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
            LIMIT ?
        `)
        .all(limit) as DbArticleRow[];

    return rows.map(dbRowToArticle);
}

export async function getFeaturedDbArticle(): Promise<DbArticle | undefined> {
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<DbArticleRow>(`
            SELECT *
            FROM articles
            WHERE status = 'published'
            ORDER BY is_featured DESC, COALESCE(publish_date, crawled_at, updated_at) DESC
            LIMIT 1
        `);
        return rows[0] ? dbRowToArticle(rows[0]) : undefined;
    }

    const row = getDb()
        .prepare(`
            SELECT *
            FROM articles
            WHERE status = 'published'
            ORDER BY is_featured DESC, COALESCE(publish_date, crawled_at, updated_at) DESC
            LIMIT 1
        `)
        .get() as DbArticleRow | undefined;

    return row ? dbRowToArticle(row) : undefined;
}

export async function getAllPublishedDbArticles(limit = 500): Promise<DbArticle[]> {
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<DbArticleRow>(
            `
                SELECT *
                FROM articles
                WHERE status = 'published'
                ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
                LIMIT $1
            `,
            [limit]
        );
        return rows.map(dbRowToArticle);
    }

    const rows = getDb()
        .prepare(`
            SELECT *
            FROM articles
            WHERE status = 'published'
            ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
            LIMIT ?
        `)
        .all(limit) as DbArticleRow[];

    return rows.map(dbRowToArticle);
}

export async function getLatestDbArticles(count = 10): Promise<DbArticle[]> {
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<DbArticleRow>(
            `
                SELECT *
                FROM articles
                WHERE status = 'published'
                ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
                LIMIT $1
            `,
            [count]
        );
        return rows.map(dbRowToArticle);
    }

    const rows = getDb()
        .prepare(`
            SELECT *
            FROM articles
            WHERE status = 'published'
            ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
            LIMIT ?
        `)
        .all(count) as DbArticleRow[];

    return rows.map(dbRowToArticle);
}

export async function getDbArticlesByCategory(categorySlug: string, count = 100): Promise<DbArticle[]> {
    const category = categoryFromValue(categorySlug);
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<DbArticleRow>(
            `
                SELECT *
                FROM articles
                WHERE status = 'published'
                  AND COALESCE(NULLIF(category, ''), $1) = $2
                ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
                LIMIT $3
            `,
            [DEFAULT_CATEGORY_SLUG, category.slug, count]
        );
        return rows.map(dbRowToArticle);
    }

    const rows = getDb()
        .prepare(`
            SELECT *
            FROM articles
            WHERE status = 'published'
              AND COALESCE(NULLIF(category, ''), ?) = ?
            ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
            LIMIT ?
        `)
        .all(DEFAULT_CATEGORY_SLUG, category.slug, count) as DbArticleRow[];

    return rows.map(dbRowToArticle);
}

export async function getDbCategoryCounts() {
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<{ category: string; count: string }>(
            `
                SELECT COALESCE(NULLIF(category, ''), $1) as category, COUNT(*)::text as count
                FROM articles
                WHERE status = 'published'
                GROUP BY 1
            `,
            [DEFAULT_CATEGORY_SLUG]
        );

        return rows.reduce<Record<string, number>>((acc, row) => {
            const category = categoryFromValue(row.category);
            acc[category.slug] = (acc[category.slug] || 0) + Number(row.count);
            return acc;
        }, {});
    }

    const rows = getDb()
        .prepare(`
            SELECT COALESCE(NULLIF(category, ''), ?) as category, COUNT(*) as count
            FROM articles
            WHERE status = 'published'
            GROUP BY COALESCE(NULLIF(category, ''), ?)
        `)
        .all(DEFAULT_CATEGORY_SLUG, DEFAULT_CATEGORY_SLUG) as Array<{ category: string; count: number }>;

    return rows.reduce<Record<string, number>>((acc, row) => {
        const category = categoryFromValue(row.category);
        acc[category.slug] = (acc[category.slug] || 0) + row.count;
        return acc;
    }, {});
}

export async function getRelatedDbArticles(article: DbArticle, count = 4): Promise<DbArticle[]> {
    const category = article.categories[0]?.slug || DEFAULT_CATEGORY_SLUG;
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<DbArticleRow>(
            `
                SELECT *
                FROM articles
                WHERE status = 'published'
                  AND id != $1
                  AND COALESCE(NULLIF(category, ''), $2) = $3
                ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
                LIMIT $4
            `,
            [Number(article.id.replace(/^db-/, '')), DEFAULT_CATEGORY_SLUG, category, count]
        );
        return rows.map(dbRowToArticle);
    }

    const rows = getDb()
        .prepare(`
            SELECT *
            FROM articles
            WHERE status = 'published'
              AND id != ?
              AND COALESCE(NULLIF(category, ''), ?) = ?
            ORDER BY COALESCE(publish_date, crawled_at, updated_at) DESC
            LIMIT ?
        `)
        .all(Number(article.id.replace(/^db-/, '')), DEFAULT_CATEGORY_SLUG, category, count) as DbArticleRow[];

    return rows.map(dbRowToArticle);
}
