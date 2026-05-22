const DEFAULT_BASE_URL = 'http://127.0.0.1:8081';
export const WECHAT_RSS_PROXY_PREFIX = '/api/admin/wechat-rss';

export function getWechatRssBaseUrl(): string {
    const raw = process.env.WECHAT_RSS_BASE_URL?.trim() || DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, '');
}

export function getWechatRssAdminToken(): string | undefined {
    const token = process.env.WECHAT_RSS_ADMIN_TOKEN?.trim();
    return token || undefined;
}

export function getWechatRssProxyBaseUrl(requestOrigin?: string): string {
    if (requestOrigin) {
        return `${requestOrigin.replace(/\/+$/, '')}${WECHAT_RSS_PROXY_PREFIX}`;
    }
    return WECHAT_RSS_PROXY_PREFIX;
}

export function buildWechatRssTargetUrl(path: string, search: string): string {
    const base = getWechatRssBaseUrl();
    const normalizedPath = path ? `/${path}` : '/';
    return `${base}${normalizedPath}${search}`;
}

export function buildWechatRssFeedUrl(subscriptionId: string): string {
    return `${getWechatRssBaseUrl()}/feeds/${subscriptionId}.rss`;
}

export function isWechatRssFeedUrl(url: string): boolean {
    try {
        const feed = new URL(url);
        const base = new URL(getWechatRssBaseUrl());
        return feed.origin === base.origin && feed.pathname.startsWith('/feeds/');
    } catch {
        return false;
    }
}

export function wechatRssAuthHeaders(incomingAuthorization?: string | null): HeadersInit {
    const headers: Record<string, string> = {};
    const token = incomingAuthorization?.trim() || (getWechatRssAdminToken() ? `Bearer ${getWechatRssAdminToken()}` : '');
    if (token) {
        headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return headers;
}

export function rewriteWechatRssRelativeUrl(url: string): string {
    if (url.startsWith(`${WECHAT_RSS_PROXY_PREFIX}/`)) {
        return url;
    }
    if (url.startsWith('/image?') || url.startsWith('/feeds/')) {
        return `${WECHAT_RSS_PROXY_PREFIX}${url}`;
    }
    return url;
}

export function rewriteWechatRssJsonUrls(value: unknown): unknown {
    if (typeof value === 'string') {
        return rewriteWechatRssRelativeUrl(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => rewriteWechatRssJsonUrls(item));
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, rewriteWechatRssJsonUrls(item)])
        );
    }
    return value;
}

export function injectProxyBaseHref(html: string, baseHref: string): string {
    if (html.includes('<base ')) {
        return html;
    }
    const baseTag = `<base href="${baseHref}">`;
    if (/<head[^>]*>/i.test(html)) {
        return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${baseTag}`);
    }
    return `${baseTag}\n${html}`;
}

/** Inject admin token into proxied wechat-rss-lite admin (do not override createLogin — it breaks closure state). */
export function injectAdminBootstrap(html: string, adminToken: string | undefined): string {
    const tokenConfigured = Boolean(adminToken);
    const escapedToken = JSON.stringify(adminToken ?? '');
    const escapedProxyPrefix = JSON.stringify(WECHAT_RSS_PROXY_PREFIX);
    const bootstrap = `<script>
(function () {
  var token = ${escapedToken};
  var proxyPrefix = ${escapedProxyPrefix};
  if (token) {
    try { localStorage.setItem("wechat-rss-lite-admin-token", token); } catch (e) {}
  }
  window.__AINOW_WECHAT_RSS_TOKEN__ = ${tokenConfigured ? 'true' : 'false'};
  window.__AINOW_WECHAT_RSS_PROXY_PREFIX__ = proxyPrefix;
  var nativeFetch = window.fetch;
  window.fetch = function (input, init) {
    init = init || {};
    if (typeof input === "string" && input.charAt(0) === "/" && input.indexOf(proxyPrefix + "/") !== 0) {
      input = proxyPrefix + input;
    }
    var method = String(init.method || (input && input.method) || "GET").toUpperCase();
    if (!/^(GET|HEAD|OPTIONS)$/.test(method)) {
      var csrf = (document.cookie.match(/(?:^|; )ainow-admin-csrf=([^;]*)/) || [])[1];
      if (csrf) {
        var headers = new Headers(init.headers || (input && input.headers) || undefined);
        headers.set("x-csrf-token", decodeURIComponent(csrf));
        init = Object.assign({}, init, { headers: headers });
      }
    }
    return nativeFetch.call(this, input, init);
  };
})();
</script>`;

    if (html.includes('</body>')) {
        return html.replace('</body>', `${bootstrap}\n</body>`);
    }
    return `${html}\n${bootstrap}`;
}

export function wechatRssAdminAuthRequiredHtml(loginUrl: string): string {
    return `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>需要登录</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;max-width:32rem">
  <h1 style="font-size:1.125rem">请先登录 AI Roar 管理后台</h1>
  <p style="color:#525252">微信公众号配置页需要有效的管理员会话。请在新标签页登录后再刷新本页。</p>
  <p><a href="${loginUrl}">前往登录</a></p>
</body>
</html>`;
}

export function isWechatRssAdminPage(subpath: string): boolean {
    const path = subpath.replace(/^\/+|\/+$/g, '');
    return path === '' || path === 'admin';
}

export async function probeWechatRssAuth(baseUrl: string, token: string): Promise<{
    configured: boolean;
    detail: string | null;
}> {
    try {
        const response = await fetch(`${baseUrl}/login/sessions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: '{}',
            signal: AbortSignal.timeout(15000),
            cache: 'no-store',
        });
        const text = await response.text();
        let detail: string | null = null;
        try {
            const json = JSON.parse(text) as { detail?: string };
            detail = json.detail ?? null;
        } catch {
            detail = text.slice(0, 200) || null;
        }

        if (response.status === 401) {
            if (detail?.includes('not configured')) {
                return { configured: false, detail };
            }
            return { configured: true, detail: detail ?? 'Invalid admin token' };
        }

        if (response.ok) {
            return { configured: true, detail: null };
        }

        return { configured: true, detail: detail ?? `Unexpected status ${response.status}` };
    } catch (err) {
        return {
            configured: false,
            detail: err instanceof Error ? err.message : 'Auth probe failed',
        };
    }
}
