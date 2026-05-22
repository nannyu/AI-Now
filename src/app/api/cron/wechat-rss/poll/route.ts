import { NextRequest, NextResponse } from 'next/server';
import { getWechatRssBaseUrl, rewriteWechatRssJsonUrls, wechatRssAuthHeaders } from '@/lib/wechat-rss';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET?.trim();
    if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = request.nextUrl.searchParams.get('limit') || '20';
    const response = await fetch(`${getWechatRssBaseUrl()}/poll?background=true&limit=${encodeURIComponent(limit)}`, {
        method: 'POST',
        headers: {
            ...wechatRssAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: '{}',
        cache: 'no-store',
        signal: AbortSignal.timeout(30000),
    });
    const text = await response.text();
    let data: unknown = text;
    try {
        data = rewriteWechatRssJsonUrls(JSON.parse(text));
    } catch {
        // Keep plain text upstream errors readable in cron logs.
    }

    return NextResponse.json(
        { ok: response.ok, status: response.status, data },
        { status: response.ok ? 200 : 502 },
    );
}
