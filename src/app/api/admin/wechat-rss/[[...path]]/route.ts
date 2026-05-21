import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest, requireAuth } from '@/lib/auth';
import {
    buildWechatRssTargetUrl,
    getWechatRssAdminToken,
    getWechatRssProxyBaseUrl,
    injectAdminBootstrap,
    injectProxyBaseHref,
    isWechatRssAdminPage,
    rewriteWechatRssJsonUrls,
    wechatRssAdminAuthRequiredHtml,
    wechatRssAuthHeaders,
} from '@/lib/wechat-rss';

type RouteContext = {
    params: Promise<{ path?: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
    const { path = [] } = await context.params;
    const subpath = path.join('/');

    const isReadRequest = ['GET', 'HEAD'].includes(request.method);

    try {
        if (isReadRequest) {
            await requireAuth();
        } else {
            await requireAdminRequest(request);
        }
    } catch {
        if (request.method === 'GET' && isWechatRssAdminPage(subpath)) {
            const origin = new URL(request.url).origin;
            return new NextResponse(wechatRssAdminAuthRequiredHtml(`${origin}/admin/login`), {
                status: 401,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const targetUrl = buildWechatRssTargetUrl(subpath, request.nextUrl.search);

    const headers = new Headers(wechatRssAuthHeaders(request.headers.get('authorization')));
    const contentType = request.headers.get('content-type');
    if (contentType) {
        headers.set('Content-Type', contentType);
    }
    const accept = request.headers.get('accept');
    if (accept) {
        headers.set('Accept', accept);
    }

    const init: RequestInit = {
        method: request.method,
        headers,
        signal: AbortSignal.timeout(120000),
        cache: 'no-store',
    };

    if (!['GET', 'HEAD'].includes(request.method)) {
        init.body = await request.arrayBuffer();
    }

    let upstream: Response;
    try {
        upstream = await fetch(targetUrl, init);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upstream request failed';
        return NextResponse.json({ error: message }, { status: 502 });
    }

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get('content-type');
    if (upstreamContentType) {
        responseHeaders.set('Content-Type', upstreamContentType);
    }

    const buffer = await upstream.arrayBuffer();

    if (upstreamContentType?.includes('application/json')) {
        try {
            const json = JSON.parse(new TextDecoder().decode(buffer));
            return NextResponse.json(rewriteWechatRssJsonUrls(json), { status: upstream.status });
        } catch {
            return new NextResponse(buffer, {
                status: upstream.status,
                headers: responseHeaders,
            });
        }
    }

    if (upstreamContentType?.includes('text/html')) {
        const origin = new URL(request.url).origin;
        const baseHref = `${getWechatRssProxyBaseUrl(origin)}/`;
        let html = injectProxyBaseHref(new TextDecoder().decode(buffer), baseHref);
        if (isWechatRssAdminPage(subpath)) {
            html = injectAdminBootstrap(html, getWechatRssAdminToken());
        }
        return new NextResponse(html, {
            status: upstream.status,
            headers: responseHeaders,
        });
    }

    return new NextResponse(buffer, {
        status: upstream.status,
        headers: responseHeaders,
    });
}

export async function GET(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, context);
}
