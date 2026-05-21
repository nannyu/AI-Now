import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
    getWechatRssAdminToken,
    getWechatRssBaseUrl,
    getWechatRssProxyBaseUrl,
    probeWechatRssAuth,
    wechatRssAuthHeaders,
} from '@/lib/wechat-rss';

export async function GET() {
    try {
        await requireAuth();
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = getWechatRssBaseUrl();
    const serverToken = getWechatRssAdminToken();
    let online = false;
    let health: Record<string, unknown> | null = null;
    let error: string | null = null;
    let upstream_token_configured = false;
    let auth_detail: string | null = null;
    let ready_for_login = false;

    try {
        const response = await fetch(`${baseUrl}/health`, {
            headers: wechatRssAuthHeaders(),
            signal: AbortSignal.timeout(5000),
            cache: 'no-store',
        });
        online = response.ok;
        if (response.ok) {
            health = await response.json();
        } else {
            error = `Health check failed (${response.status})`;
        }
    } catch (err) {
        error = err instanceof Error ? err.message : 'Health check failed';
    }

    if (online && serverToken) {
        const auth = await probeWechatRssAuth(baseUrl, serverToken);
        upstream_token_configured = auth.configured;
        auth_detail = auth.detail;
        ready_for_login = auth.configured && !auth.detail;
    } else if (online && !serverToken) {
        auth_detail = '未配置 WECHAT_RSS_ADMIN_TOKEN。运行 npm run wechat-rss:sync-env 后重启服务。';
    }

    return NextResponse.json({
        base_url: baseUrl,
        proxy_path: getWechatRssProxyBaseUrl(),
        online,
        health,
        has_server_token: Boolean(serverToken),
        upstream_token_configured,
        ready_for_login,
        auth_detail,
        error,
    });
}
