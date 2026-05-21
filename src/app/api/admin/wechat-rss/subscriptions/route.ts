import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest, requireAuth } from '@/lib/auth';
import { getWechatRssBaseUrl, rewriteWechatRssJsonUrls, wechatRssAuthHeaders } from '@/lib/wechat-rss';

type WechatSubscription = {
    id: string;
    title: string;
};

async function readUpstreamJson(response: Response) {
    const json = await response.json();
    return rewriteWechatRssJsonUrls(json);
}

export async function GET() {
    try {
        await requireAuth();
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(`${getWechatRssBaseUrl()}/subscriptions`, {
            headers: {
                ...wechatRssAuthHeaders(),
                Accept: 'application/json',
            },
            signal: AbortSignal.timeout(15000),
            cache: 'no-store',
        });

        if (!response.ok) {
            const detail = await response.text();
            return NextResponse.json(
                { error: `Failed to load subscriptions (${response.status}): ${detail}` },
                { status: 502 }
            );
        }

        const subscriptions = (await readUpstreamJson(response)) as WechatSubscription[];
        return NextResponse.json(subscriptions);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load subscriptions';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await fetch(`${getWechatRssBaseUrl()}/subscriptions`, {
            method: 'POST',
            headers: {
                ...wechatRssAuthHeaders(request.headers.get('authorization')),
                'Content-Type': request.headers.get('content-type') || 'application/json',
                Accept: 'application/json',
            },
            body: await request.arrayBuffer(),
            signal: AbortSignal.timeout(15000),
            cache: 'no-store',
        });

        const data = await readUpstreamJson(response);
        return NextResponse.json(data, { status: response.status });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create subscription';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}
