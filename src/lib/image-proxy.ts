export function unwrapAdminImageProxyUrls(value: string) {
    return value.replace(/\/api\/admin\/wechat-rss\/image\?url=([^"'&<>\s]+)/g, (_match, encodedUrl: string) => {
        try {
            return decodeURIComponent(encodedUrl);
        } catch {
            return encodedUrl;
        }
    });
}

export function publicImageProxyUrl(value: string) {
    if (!value) return '';
    const normalizedProxyUrl = normalizePublicProxyPath(value);
    if (normalizedProxyUrl.startsWith('/api/image?')) return normalizedProxyUrl;
    if (!isWechatImageUrl(normalizedProxyUrl)) return normalizedProxyUrl;
    return `/api/image?url=${encodeURIComponent(normalizedProxyUrl)}`;
}

export function proxyWechatImages(html: string) {
    if (!html) return '';
    const unwrapped = unwrapAdminImageProxyUrls(html);
    return unwrapped.replace(/(src=["'])([^"']+)(["'])/gi, (_match, prefix: string, src: string, suffix: string) => {
        return `${prefix}${publicImageProxyUrl(src)}${suffix}`;
    });
}

function isWechatImageUrl(value: string) {
    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();
        return (
            hostname === 'mmbiz.qpic.cn' ||
            hostname.endsWith('.qpic.cn') ||
            hostname === 'mmbiz.qlogo.cn' ||
            hostname.endsWith('.qlogo.cn')
        );
    } catch {
        return false;
    }
}

function normalizePublicProxyPath(value: string) {
    if (value.startsWith('/image?')) {
        return `/api/image?${value.slice('/image?'.length)}`;
    }

    try {
        const url = new URL(value);
        if (url.pathname === '/image') {
            return `/api/image?${url.searchParams.toString()}`;
        }
    } catch {
        // Relative URLs that are not legacy image proxy URLs should pass through unchanged.
    }

    return value;
}
