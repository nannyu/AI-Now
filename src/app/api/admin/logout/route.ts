import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdminRequest, signOut } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await requireAdminRequest(request);
        await signOut();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
}
