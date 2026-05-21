import { lookup } from 'node:dns/promises';
import net from 'node:net';

type FeedUrlValidation =
    | { ok: true; url: string }
    | { ok: false; error: string };

export async function validateFeedUrl(input: string): Promise<FeedUrlValidation> {
    let url: URL;
    try {
        url = new URL(input);
    } catch {
        return { ok: false, error: 'Feed URL must be a valid URL' };
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        return { ok: false, error: 'Feed URL must use http or https' };
    }

    if (!url.hostname) {
        return { ok: false, error: 'Feed URL must include a hostname' };
    }

    if (process.env.ALLOW_PRIVATE_FEED_URLS === 'true') {
        return { ok: true, url: url.toString() };
    }

    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
        return { ok: false, error: 'Feed URL cannot target localhost' };
    }

    const addresses = await resolveHostname(hostname);
    if (addresses.length === 0) {
        return { ok: false, error: 'Feed URL hostname could not be resolved' };
    }

    if (addresses.some((address) => isPrivateAddress(address))) {
        return { ok: false, error: 'Feed URL cannot target private or local network addresses' };
    }

    return { ok: true, url: url.toString() };
}

async function resolveHostname(hostname: string) {
    if (net.isIP(hostname)) {
        return [hostname];
    }

    try {
        const records = await lookup(hostname, { all: true, verbatim: true });
        return records.map((record) => record.address);
    } catch {
        return [];
    }
}

function isPrivateAddress(address: string) {
    if (address.startsWith('::ffff:')) {
        return isPrivateAddress(address.slice(7));
    }

    const ipVersion = net.isIP(address);
    if (ipVersion === 4) {
        const [a, b] = address.split('.').map(Number);
        return (
            a === 0 ||
            a === 10 ||
            a === 127 ||
            (a === 100 && b >= 64 && b <= 127) ||
            (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) ||
            a >= 224
        );
    }

    if (ipVersion === 6) {
        const normalized = address.toLowerCase();
        return (
            normalized === '::1' ||
            normalized === '::' ||
            normalized.startsWith('fc') ||
            normalized.startsWith('fd') ||
            normalized.startsWith('fe8') ||
            normalized.startsWith('fe9') ||
            normalized.startsWith('fea') ||
            normalized.startsWith('feb')
        );
    }

    return true;
}
