import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { validateFeedUrl } from '@/lib/url-security';
import { isWechatRssFeedUrl, wechatRssAuthHeaders } from '@/lib/wechat-rss';
import { insertArticleDrafts } from '@/lib/article-ingest';

type RssSource = {
    name: string;
    feed_url: string;
};

type ParsedRssArticle = {
    title: string;
    link: string;
    description: string;
    content: string;
    author: string;
    pubDate: string;
    image: string;
};

/**
 * Fetches articles from a wechat-rss-lite source and stores them in the database.
 * Expects the wechat-rss-lite service to be running and accessible.
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source_id } = await request.json() as { source_id?: unknown };

    if (!source_id) {
        return NextResponse.json({ error: 'source_id is required' }, { status: 400 });
    }
    const sourceId = Number(source_id);
    if (!Number.isFinite(sourceId)) {
        return NextResponse.json({ error: 'source_id must be a valid number' }, { status: 400 });
    }

    const db = getDb();
    const source = db.prepare<unknown[], RssSource>(
        'SELECT name, feed_url FROM rss_sources WHERE id = ?'
    ).get(sourceId);

    if (!source) {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    try {
        const feedUrl = await validateFeedUrl(source.feed_url);
        if (!feedUrl.ok) {
            return NextResponse.json({ error: feedUrl.error }, { status: 400 });
        }

        // Fetch RSS feed from wechat-rss-lite
        const headers: HeadersInit = { 'User-Agent': 'AI-Roar-Crawler/1.0' };
        if (isWechatRssFeedUrl(feedUrl.url)) {
            Object.assign(headers, wechatRssAuthHeaders());
        }

        const response = await fetch(feedUrl.url, {
            headers,
            signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${response.status}`);
        }

        const feedText = await response.text();

        // Parse RSS/XML feed
        const articles = parseRssFeed(feedText);

        const { ingested, skipped } = insertArticleDrafts(
            db,
            articles.map((article) => ({
                sourceId,
                sourceUrl: article.link,
                title: article.title,
                summary: article.description,
                body: article.content,
                author: article.author || source.name,
                coverImage: article.image,
                publishDate: article.pubDate,
            }))
        );

        // Update last fetched time
        db.prepare('UPDATE rss_sources SET last_fetched_at = datetime(\'now\') WHERE id = ?').run(sourceId);

        return NextResponse.json({
            success: true,
            total: articles.length,
            ingested,
            skipped,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to fetch source: ${message}` },
            { status: 500 }
        );
    }
}

/**
 * Simple RSS/XML parser for wechat-rss-lite feeds.
 */
function parseRssFeed(xml: string): ParsedRssArticle[] {
    const items: ParsedRssArticle[] = [];

    // Match all <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        const title = extractTag(itemXml, 'title');
        const link = extractTag(itemXml, 'link');
        const description = extractTag(itemXml, 'description');
        const content = extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'content');
        const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator');
        const pubDate = extractTag(itemXml, 'pubDate');
        const image = extractTag(itemXml, 'enclosure')
            ? (itemXml.match(/url="([^"]+)"/) || [])[1] || ''
            : '';

        items.push({ title, link, description, content: content || description, author, pubDate, image });
    }

    return items;
}

function extractTag(xml: string, tag: string): string {
    // Handle CDATA
    const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
    const cdataMatch = xml.match(cdataRegex);
    if (cdataMatch) return cdataMatch[1].trim();

    // Handle regular content
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}
