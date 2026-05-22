import { NextRequest, NextResponse } from 'next/server';
import { signInReader } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const { username, password } = await request.json().catch(() => ({}));
    const identifier = typeof username === 'string' ? username.trim() : '';
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!identifier || !cleanPassword) {
        return NextResponse.json({ error: '请填写用户名/邮箱和密码。' }, { status: 400 });
    }

    const success = await signInReader(identifier, cleanPassword);
    if (!success) {
        return NextResponse.json({ error: '用户名、邮箱或密码不正确。' }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
}
