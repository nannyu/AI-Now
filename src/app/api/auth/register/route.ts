import { NextRequest, NextResponse } from 'next/server';
import { registerReaderUser, signInReader } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
    const { username, email, password } = await request.json().catch(() => ({}));
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPassword = typeof password === 'string' ? password : '';

    if (cleanUsername.length < 2 || cleanUsername.length > 32) {
        return NextResponse.json({ error: '用户名需要为 2-32 个字符。' }, { status: 400 });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
        return NextResponse.json({ error: '请填写有效邮箱。' }, { status: 400 });
    }
    if (cleanPassword.length < 8) {
        return NextResponse.json({ error: '密码至少需要 8 个字符。' }, { status: 400 });
    }

    try {
        await registerReaderUser(cleanUsername, cleanEmail, cleanPassword);
        await signInReader(cleanUsername, cleanPassword);
        return NextResponse.json({
            authenticated: true,
            user: { username: cleanUsername, email: cleanEmail },
            emailVerificationPlanned: true,
        }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('UNIQUE')) {
            return NextResponse.json({ error: '用户名或邮箱已被注册。' }, { status: 409 });
        }
        return NextResponse.json({ error: '注册失败，请稍后重试。' }, { status: 500 });
    }
}
