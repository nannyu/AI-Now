import { sanitizeArticleHtml } from './html-sanitizer';
import { normalizeEscapedWhitespace } from './text-normalize';

/**
 * Converts raw WeChat article HTML into clean, website-adapted content.
 * Strips WeChat-specific styling, ads, and formatting while preserving
 * semantic structure (headings, paragraphs, lists, images, blockquotes).
 */

export function convertWechatContent(rawHtml: string): string {
    if (!rawHtml) return '';

    let html = normalizeEscapedWhitespace(rawHtml);

    // Remove script and style tags
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '');

    // Remove WeChat-specific elements
    html = html.replace(/<mpvoice[\s\S]*?<\/mpvoice>/gi, '');
    html = html.replace(/<mp-miniprogram[\s\S]*?<\/mp-miniprogram>/gi, '');
    html = html.replace(/<mp-common-product[\s\S]*?<\/mp-common-product>/gi, '');

    // Remove inline styles but keep the tags
    html = html.replace(/\s*style="[^"]*"/gi, '');
    html = html.replace(/\s*class="[^"]*"/gi, '');

    // Remove empty spans and divs
    html = html.replace(/<span[^>]*>\s*<\/span>/gi, '');
    html = html.replace(/<div[^>]*>\s*<\/div>/gi, '');

    // Convert WeChat section/div structure to semantic HTML
    html = html.replace(/<section[^>]*>/gi, '<div>');
    html = html.replace(/<\/section>/gi, '</div>');

    // Normalize image tags - extract src from data-src (WeChat lazy loading)
    html = html.replace(/data-src="([^"]+)"/gi, 'src="$1"');

    // Remove width/height attributes from images
    html = html.replace(/<img([^>]*)\s*width="[^"]*"/gi, '<img$1');
    html = html.replace(/<img([^>]*)\s*height="[^"]*"/gi, '<img$1');

    // Ensure images have proper attributes
    html = html.replace(/<img([^>]*)>/gi, (match, attrs) => {
        if (!attrs.includes('alt=')) {
            attrs += ' alt=""';
        }
        if (!attrs.includes('loading=')) {
            attrs += ' loading="lazy"';
        }
        return `<img${attrs}>`;
    });

    // Convert strong/b to proper emphasis
    html = html.replace(/<b>/gi, '<strong>');
    html = html.replace(/<\/b>/gi, '</strong>');

    // Clean up excessive whitespace and empty paragraphs
    html = html.replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, '');
    html = html.replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/gi, '');
    html = html.replace(/<p[^>]*>\s*<\/p>/gi, '');

    // Remove nested divs, flatten to paragraphs where appropriate
    html = html.replace(/<div[^>]*>\s*<p/gi, '<p');
    html = html.replace(/<\/p>\s*<\/div>/gi, '</p>');

    // Clean up remaining empty divs
    html = html.replace(/<div[^>]*>\s*<\/div>/gi, '');

    // Normalize line breaks
    html = html.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>');

    // Remove data-* attributes
    html = html.replace(/\s*data-[a-z-]+="[^"]*"/gi, '');

    // Remove id attributes
    html = html.replace(/\s*id="[^"]*"/gi, '');

    // Final cleanup - trim and normalize whitespace
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
    html = html.trim();

    return sanitizeArticleHtml(html);
}

/**
 * Extracts a plain text summary from HTML content.
 */
export function extractSummary(html: string, maxLength: number = 200): string {
    // Strip all HTML tags
    const text = normalizeEscapedWhitespace(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Extracts the first image URL from HTML content for use as cover image.
 */
export function extractCoverImage(html: string): string {
    const match = html.match(/<img[^>]+src="([^"]+)"/i);
    return match ? match[1] : '';
}

/**
 * Estimates reading time in minutes.
 */
export function estimateReadingTime(html: string, locale: string = 'zh'): number {
    const text = html.replace(/<[^>]+>/g, '');
    if (locale === 'zh') {
        // Chinese: ~300 characters per minute
        return Math.max(1, Math.ceil(text.length / 300));
    }
    // English/German: ~200 words per minute
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}
