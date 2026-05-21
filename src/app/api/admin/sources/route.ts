import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const sources = db.prepare('SELECT * FROM rss_sources ORDER BY created_at DESC').all();
    return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, feed_url } = await request.json();

    if (!name || !feed_url) {
        return NextResponse.json({ error: 'Name and feed URL are required' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare('INSERT INTO rss_sources (name, feed_url) VALUES (?, ?)').run(name, feed_url);

    return NextResponse.json({ id: result.lastInsertRowid, name, feed_url, is_active: 1 });
}

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM rss_sources WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, is_active } = await request.json();

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    db.prepare('UPDATE rss_sources SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, id);

    return NextResponse.json({ success: true });
}
