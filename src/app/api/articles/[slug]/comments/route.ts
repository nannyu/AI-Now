import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireReaderRequest } from '@/lib/auth';

type RouteContext = {
    params: Promise<{ slug: string }>;
};

function articleIdFromSlug(slug: string): number | null {
    const dbId = /^db-(\d+)$/.exec(slug);
    const numericId = dbId ? Number(dbId[1]) : (/^\d+$/.test(slug) ? Number(slug) : null);

    if (numericId) {
        const row = getDb().prepare(`
            SELECT id
            FROM articles
            WHERE id = ? AND status = 'published'
        `).get(numericId) as { id: number } | undefined;
        return row?.id ?? null;
    }

    const row = getDb().prepare(`
        SELECT id
        FROM articles
        WHERE slug = ? AND status = 'published'
    `).get(slug) as { id: number } | undefined;

    return row?.id ?? null;
}

function cleanText(value: unknown, maxLength: number) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export async function GET(_request: NextRequest, context: RouteContext) {
    const { slug } = await context.params;
    const articleId = articleIdFromSlug(slug);
    if (!articleId) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const comments = getDb().prepare(`
        SELECT
            c.id,
            c.body,
            c.quote,
            c.created_at,
            u.username
        FROM article_comments c
        JOIN reader_users u ON u.id = c.user_id
        WHERE c.article_id = ?
        ORDER BY c.created_at DESC, c.id DESC
    `).all(articleId);

    return NextResponse.json({ comments });
}

export async function POST(request: NextRequest, context: RouteContext) {
    let session;
    try {
        session = await requireReaderRequest(request);
    } catch {
        return NextResponse.json({ error: '请先登录后再评论。' }, { status: 401 });
    }

    const { slug } = await context.params;
    const articleId = articleIdFromSlug(slug);
    if (!articleId) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const comment = cleanText(body.comment, 1200);
    const quote = cleanText(body.quote, 500);

    if (comment.length < 1) {
        return NextResponse.json({ error: '评论不能为空。' }, { status: 400 });
    }

    const result = getDb().prepare(`
        INSERT INTO article_comments (article_id, user_id, body, quote)
        VALUES (?, ?, ?, ?)
    `).run(articleId, session.userId, comment, quote);

    const saved = getDb().prepare(`
        SELECT
            c.id,
            c.body,
            c.quote,
            c.created_at,
            u.username
        FROM article_comments c
        JOIN reader_users u ON u.id = c.user_id
        WHERE c.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ comment: saved }, { status: 201 });
}
