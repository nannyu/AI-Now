import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: '请输入用户名和密码' },
                { status: 400 }
            );
        }

        const success = await signIn(username, password);

        if (!success) {
            return NextResponse.json(
                { error: '用户名或密码不正确' },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}
