import { NextResponse } from 'next/server';
import { ensureCsrfToken, getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    await ensureCsrfToken();
    return NextResponse.json({ authenticated: true, username: session.username });
}
