import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getReaderSession, refreshReaderSession, requireReaderRequest } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
    const session = await getReaderSession();
    if (!session) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            username: session.username,
            email: session.email,
        },
        emailVerificationPlanned: true,
    });
}

export async function PATCH(request: NextRequest) {
    let session;
    try {
        session = await requireReaderRequest(request);
    } catch {
        return NextResponse.json({ error: '请先登录。' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const username = typeof body.username === 'string' ? body.username.trim() : session.username;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : session.email;
    const password = typeof body.password === 'string' ? body.password : '';

    if (username.length < 2 || username.length > 32) {
        return NextResponse.json({ error: '用户名需要为 2-32 个字符。' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: '请填写有效邮箱。' }, { status: 400 });
    }
    if (password && password.length < 8) {
        return NextResponse.json({ error: '新密码至少需要 8 个字符。' }, { status: 400 });
    }

    const db = getDb();
    try {
        if (password) {
            db.prepare(`
                UPDATE reader_users
                SET username = ?, email = ?, password_hash = ?, updated_at = datetime('now')
                WHERE id = ?
            `).run(username, email, hashPassword(password), session.userId);
        } else {
            db.prepare(`
                UPDATE reader_users
                SET username = ?, email = ?, updated_at = datetime('now')
                WHERE id = ?
            `).run(username, email, session.userId);
        }

        const updated = db.prepare(`
            SELECT id, username, email
            FROM reader_users
            WHERE id = ?
        `).get(session.userId) as { id: number; username: string; email: string };

        await refreshReaderSession(updated);
        return NextResponse.json({
            authenticated: true,
            user: {
                username: updated.username,
                email: updated.email,
            },
            emailVerificationPlanned: true,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('UNIQUE')) {
            return NextResponse.json({ error: '用户名或邮箱已被占用。' }, { status: 409 });
        }
        return NextResponse.json({ error: '保存失败，请稍后重试。' }, { status: 500 });
    }
}
