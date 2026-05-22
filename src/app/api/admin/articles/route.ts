import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAdminRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sanitizeArticleHtml } from '@/lib/html-sanitizer';
import { dbArticleSlug } from '@/lib/db-articles';
import { insertArticleDraft } from '@/lib/article-ingest';
import { normalizeCategorySlug } from '@/lib/article-categories';
import { isArticleStatus } from '@/lib/article-status';

function normalizeEditablePublishDate(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') {
        throw new Error('Invalid publish_date value');
    }

    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('Invalid publish_date value');
    }
    return parsed.toISOString();
}

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const db = getDb();
    db.exec("DELETE FROM articles WHERE status = 'trash' AND deleted_at <= datetime('now', '-30 days')");

    let query = 'SELECT * FROM articles';
    let countQuery = 'SELECT COUNT(*) as total FROM articles';
    const params: any[] = [];

    if (status) {
        query += ' WHERE status = ?';
        countQuery += ' WHERE status = ?';
        params.push(status);
    } else {
        query += " WHERE status != 'trash'";
        countQuery += " WHERE status != 'trash'";
    }

    query += ' ORDER BY COALESCE(deleted_at, publish_date, crawled_at, updated_at) DESC LIMIT ? OFFSET ?';

    const articles = (db.prepare(query).all(...params, limit, offset) as Array<{ id: number; slug?: string | null }>).map((article) => ({
        ...article,
        slug: article.slug || dbArticleSlug(article.id),
    }));
    const { total } = db.prepare(countQuery).get(...params) as any;

    return NextResponse.json({
        articles,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function PATCH(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, ...updates } = body;

    if (!id && (!Array.isArray(ids) || ids.length === 0)) {
        return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const db = getDb();

    if (Array.isArray(ids) && ids.length > 0) {
        const nextStatus = typeof updates.status === 'string' ? updates.status : null;
        if (!nextStatus) {
            return NextResponse.json({ error: 'Status is required for batch update' }, { status: 400 });
        }
        if (!isArticleStatus(nextStatus)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }
        const cleanIds = ids.map(Number).filter(Number.isFinite);
        if (cleanIds.length === 0) {
            return NextResponse.json({ error: 'Valid article IDs are required' }, { status: 400 });
        }
        const placeholders = cleanIds.map(() => '?').join(',');
        if (nextStatus === 'published') {
            db.prepare(`
                UPDATE articles
                SET
                    status = ?,
                    publish_date = CASE
                        WHEN source_url LIKE 'manual:%' THEN COALESCE(publish_date, ?)
                        ELSE publish_date
                    END,
                    deleted_at = NULL,
                    updated_at = datetime('now')
                WHERE id IN (${placeholders})
            `).run(nextStatus, new Date().toISOString(), ...cleanIds);
        } else if (nextStatus === 'trash') {
            db.prepare(`
                UPDATE articles
                SET status = ?, is_featured = 0, deleted_at = datetime('now'), updated_at = datetime('now')
                WHERE id IN (${placeholders})
            `).run(nextStatus, ...cleanIds);
        } else {
            db.prepare(`
                UPDATE articles
                SET status = ?, deleted_at = NULL, updated_at = datetime('now')
                WHERE id IN (${placeholders})
            `).run(nextStatus, ...cleanIds);
        }
        return NextResponse.json({ success: true, updated: cleanIds.length });
    }

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    const shouldEnsurePublishDate = updates.status === 'published' && updates.publish_date === undefined;

    const allowedFields = ['title', 'summary', 'body', 'author', 'cover_image', 'category', 'status', 'is_featured', 'publish_date'];

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            if (key === 'status' && typeof value === 'string' && !isArticleStatus(value)) {
                return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
            }
            fields.push(`${key} = ?`);
            if (key === 'body' && typeof value === 'string') {
                values.push(sanitizeArticleHtml(value));
            } else if (key === 'category' && typeof value === 'string') {
                values.push(normalizeCategorySlug(value));
            } else if (key === 'publish_date') {
                try {
                    values.push(normalizeEditablePublishDate(value));
                } catch {
                    return NextResponse.json({ error: 'Invalid publish_date value' }, { status: 400 });
                }
            } else {
                values.push(value);
            }
        }
    }

    if (typeof updates.status === 'string') {
        if (updates.status === 'trash') {
            fields.push('deleted_at = datetime(\'now\')');
            fields.push('is_featured = 0');
        } else {
            fields.push('deleted_at = NULL');
        }
    }

    if (shouldEnsurePublishDate) {
        fields.push(`
            publish_date = CASE
                WHEN source_url LIKE 'manual:%' THEN COALESCE(publish_date, ?)
                ELSE publish_date
            END
        `);
        values.push(new Date().toISOString());
    }

    if (fields.length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    return NextResponse.json(article);
}

export async function POST(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();
    const result = insertArticleDraft(db, {
        sourceUrl: body.source_url || `manual:${crypto.randomUUID()}`,
        title: body.title || '',
        summary: body.summary || '',
        body: body.body || '',
        author: body.author || '',
        coverImage: body.cover_image || '',
        category: body.category || '',
        publishDate: null,
    });

    if (!result.inserted) {
        return NextResponse.json({ error: 'Article already exists or title is empty' }, { status: 400 });
    }

    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.id);
    return NextResponse.json(article, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const ids = searchParams.get('ids');

    const db = getDb();
    if (ids) {
        const cleanIds = ids.split(',').map(Number).filter(Number.isFinite);
        if (cleanIds.length === 0) return NextResponse.json({ error: 'Valid IDs are required' }, { status: 400 });
        const placeholders = cleanIds.map(() => '?').join(',');
        db.prepare(`
            UPDATE articles
            SET status = 'trash', is_featured = 0, deleted_at = datetime('now'), updated_at = datetime('now')
            WHERE id IN (${placeholders})
        `).run(...cleanIds);
        return NextResponse.json({ success: true, deleted: cleanIds.length });
    }

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    db.prepare(`
        UPDATE articles
        SET status = 'trash', is_featured = 0, deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
    `).run(id);

    return NextResponse.json({ success: true });
}
