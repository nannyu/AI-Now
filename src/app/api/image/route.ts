import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
    'mmbiz.qpic.cn',
    'mmbiz.qlogo.cn',
    'wx.qlogo.cn',
];

function isAllowedImageUrl(input: string) {
    try {
        const url = new URL(input);
        const hostname = url.hostname.toLowerCase();
        return (
            url.protocol === 'https:' &&
            ALLOWED_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
        );
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url') || '';
    if (!isAllowedImageUrl(url)) {
        return NextResponse.json({ error: 'Image URL is not allowed' }, { status: 400 });
    }

    try {
        const upstream = await fetch(url, {
            headers: {
                Referer: 'https://mp.weixin.qq.com/',
                'User-Agent': 'Mozilla/5.0 (compatible; AI-Now-ImageProxy/1.0)',
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(15000),
            cache: 'force-cache',
        });

        if (!upstream.ok) {
            return NextResponse.json({ error: `Image fetch failed (${upstream.status})` }, { status: 502 });
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        if (!contentType.startsWith('image/')) {
            return NextResponse.json({ error: 'Upstream response is not an image' }, { status: 502 });
        }

        return new NextResponse(await upstream.arrayBuffer(), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Image fetch failed';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}
