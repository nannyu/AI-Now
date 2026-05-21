export function normalizeEscapedWhitespace(value?: string | null): string {
    if (!value) return '';

    return value
        .replace(/\\x0d\\x0a/gi, '\n')
        .replace(/\\x0a/gi, '\n')
        .replace(/\\x0d/gi, '\n')
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\n')
        .replace(/\\t/g, ' ')
        .replace(/\u00a0/g, ' ');
}

export function normalizeInlineWhitespace(value?: string | null): string {
    return normalizeEscapedWhitespace(value).replace(/\s+/g, ' ').trim();
}
