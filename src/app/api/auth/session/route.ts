import { NextResponse } from 'next/server';
import { getReaderSession } from '@/lib/auth';

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
    });
}
