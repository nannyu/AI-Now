import type Database from 'better-sqlite3';
import { convertWechatContent, extractCoverImage, extractSummary } from './content-converter';
import { sanitizeArticleHtml } from './html-sanitizer';
import { proxyWechatImages, publicImageProxyUrl, unwrapAdminImageProxyUrls } from './image-proxy';
import { normalizeEscapedWhitespace, normalizeInlineWhitespace } from './text-normalize';
import { inferArticleCategorySlug } from './article-categories';

export type ArticleDraftInput = {
    sourceId?: number | null;
    sourceUrl: string;
    title: string;
    summary?: string;
    body?: string;
    author?: string;
    coverImage?: string;
    category?: string;
    publishDate?: string | null;
};

export type IngestResult = {
    ingested: number;
    skipped: number;
};

function normalizePublishDate(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}

export function normalizeArticleDraft(input: ArticleDraftInput) {
    const rawBody = normalizeEscapedWhitespace(input.body || input.summary || '');
    const cleanBody = proxyWechatImages(unwrapAdminImageProxyUrls(convertWechatContent(rawBody)));
    const summary = normalizeInlineWhitespace(input.summary) || extractSummary(cleanBody);
    const coverImage = publicImageProxyUrl(unwrapAdminImageProxyUrls(input.coverImage || extractCoverImage(cleanBody)));

    return {
        sourceId: input.sourceId ?? null,
        sourceUrl: input.sourceUrl,
        title: normalizeInlineWhitespace(input.title),
        summary,
        body: cleanBody,
        author: normalizeInlineWhitespace(input.author) || 'AI Roar',
        coverImage,
        category: inferArticleCategorySlug({
            title: input.title,
            summary: input.summary,
            body: rawBody,
            fallback: input.category,
        }),
        publishDate: normalizePublishDate(input.publishDate),
    };
}

export function insertArticleDraft(db: Database.Database, input: ArticleDraftInput) {
    const draft = normalizeArticleDraft(input);
    if (!draft.title || !draft.sourceUrl) {
        return { inserted: false, id: null };
    }

    const result = db.prepare(`
      INSERT OR IGNORE INTO articles (
        source_id,
        source_url,
        title,
        summary,
        body,
        author,
        cover_image,
        category,
        status,
        publish_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)
    `).run(
        draft.sourceId,
        draft.sourceUrl,
        draft.title,
        draft.summary,
        sanitizeArticleHtml(draft.body),
        draft.author,
        draft.coverImage,
        draft.category,
        draft.publishDate
    );

    if (result.changes === 0) {
        if (draft.publishDate) {
            db.prepare(`
                UPDATE articles
                SET publish_date = COALESCE(NULLIF(publish_date, ''), ?)
                WHERE source_url = ?
            `).run(draft.publishDate, draft.sourceUrl);
        }
        if (draft.author && draft.author !== 'AI Roar') {
            db.prepare(`
                UPDATE articles
                SET author = ?
                WHERE source_url = ?
                  AND source_url NOT LIKE 'seed:%'
                  AND source_url NOT LIKE 'manual:%'
            `).run(draft.author, draft.sourceUrl);
        }
    }

    return {
        inserted: result.changes > 0,
        id: result.lastInsertRowid,
    };
}

export function insertArticleDrafts(db: Database.Database, inputs: ArticleDraftInput[]): IngestResult {
    let ingested = 0;
    let skipped = 0;

    const insertMany = db.transaction((items: ArticleDraftInput[]) => {
        for (const item of items) {
            const result = insertArticleDraft(db, item);
            if (result.inserted) {
                ingested++;
            } else {
                skipped++;
            }
        }
    });

    insertMany(inputs);
    return { ingested, skipped };
}
