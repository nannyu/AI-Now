import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminJob } from '@/lib/admin-jobs';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        await requireAuth();
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const job = await getAdminJob(id);
    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
}
