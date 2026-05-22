import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { insertArticleDrafts, type ArticleDraftInput } from '@/lib/article-ingest';
import { unwrapAdminImageProxyUrls } from '@/lib/image-proxy';
import { getWechatRssBaseUrl, rewriteWechatRssJsonUrls, wechatRssAuthHeaders } from '@/lib/wechat-rss';

type WechatSubscription = {
    id: string;
    title: string;
    enabled?: boolean;
};

type WechatArticle = {
    url: string;
    title: string;
    author?: string;
    account_name?: string;
    summary?: string;
    content_html?: string;
    text?: string;
    published_at?: string | null;
    images?: Array<{ url: string; alt?: string }>;
};

async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${getWechatRssBaseUrl()}${path}`, {
        ...init,
        headers: {
            ...wechatRssAuthHeaders(),
            Accept: 'application/json',
            ...(init.headers || {}),
        },
        signal: AbortSignal.timeout(60000),
        cache: 'no-store',
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`wechat-rss-lite ${path} failed (${response.status}): ${detail}`);
    }

    return rewriteWechatRssJsonUrls(await response.json()) as T;
}

function toDraft(article: WechatArticle, subscription: WechatSubscription): ArticleDraftInput {
    const firstImage = article.images?.[0]?.url || '';
    const accountName = subscription.title.trim() || article.account_name?.trim() || '';
    return {
        sourceUrl: article.url,
        title: article.title,
        summary: article.summary || article.text?.slice(0, 220) || '',
        body: unwrapAdminImageProxyUrls(article.content_html || article.text || article.summary || ''),
        author: accountName,
        coverImage: unwrapAdminImageProxyUrls(firstImage),
        category: subscription.title,
        publishDate: article.published_at ?? null,
    };
}


export async function POST(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const selectedIds = Array.isArray(body.subscription_ids) ? body.subscription_ids.map(String) : [];
        if (selectedIds.length === 0) {
            return NextResponse.json({ error: 'At least one subscription_id is required' }, { status: 400 });
        }
        const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 200);
        const refreshHistory = Boolean(body.refresh_history);

        const subscriptions = await fetchJson<WechatSubscription[]>('/subscriptions');
        const selected = subscriptions.filter(
            (item) => item.enabled !== false && selectedIds.includes(item.id)
        );

        if (selected.length === 0) {
            return NextResponse.json({ error: 'No subscriptions selected' }, { status: 400 });
        }

        const drafts: ArticleDraftInput[] = [];
        const errors: string[] = [];

        for (const subscription of selected) {
            try {
                if (refreshHistory) {
                    await fetchJson(
                        `/subscriptions/${encodeURIComponent(subscription.id)}/history?pages=3&page_size=${limit}`,
                        { method: 'POST' }
                    );
                }

                const articles = await fetchJson<WechatArticle[]>(
                    `/subscriptions/${encodeURIComponent(subscription.id)}/articles?limit=${limit}`
                );
                drafts.push(...articles.map((article) => toDraft(article, subscription)));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown import error';
                errors.push(`${subscription.title}: ${message}`);
            }
        }

        const result = insertArticleDrafts(getDb(), drafts);

        return NextResponse.json({
            success: errors.length === 0,
            subscriptions: selected.length,
            total: drafts.length,
            ingested: result.ingested,
            skipped: result.skipped,
            errors,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to import articles';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
