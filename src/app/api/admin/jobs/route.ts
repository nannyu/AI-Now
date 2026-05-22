import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { listAdminJobs } from '@/lib/admin-jobs';

export async function GET(request: NextRequest) {
    try {
        await requireAuth();
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = Number(request.nextUrl.searchParams.get('limit') || 20);
    return NextResponse.json(await listAdminJobs(limit));
}
