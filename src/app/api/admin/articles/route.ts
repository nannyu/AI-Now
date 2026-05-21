import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAdminRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sanitizeArticleHtml } from '@/lib/html-sanitizer';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const db = getDb();

    let query = 'SELECT * FROM articles';
    let countQuery = 'SELECT COUNT(*) as total FROM articles';
    const params: any[] = [];

    if (status) {
        query += ' WHERE status = ?';
        countQuery += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY crawled_at DESC LIMIT ? OFFSET ?';

    const articles = db.prepare(query).all(...params, limit, offset);
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
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });

    const db = getDb();

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = ['title', 'summary', 'body', 'author', 'cover_image', 'category', 'status', 'is_featured', 'publish_date'];

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            fields.push(`${key} = ?`);
            values.push(key === 'body' && typeof value === 'string' ? sanitizeArticleHtml(value) : value);
        }
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

export async function DELETE(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM articles WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
}
