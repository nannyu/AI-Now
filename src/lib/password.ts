import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): string {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [scheme, salt, hash] = storedHash.split('$');
    if (scheme !== 'scrypt' || !salt || !hash) {
        return false;
    }

    const expected = Buffer.from(hash, 'base64url');
    const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
