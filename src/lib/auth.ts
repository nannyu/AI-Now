import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import { getDb } from './db';
import { verifyPassword } from './password';

const COOKIE_NAME = 'ainow-admin-token';
const CSRF_COOKIE_NAME = 'ainow-admin-csrf';

type AdminUser = {
    id: number;
    username: string;
    password_hash: string;
};

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is required');
    }
    if (secret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters');
    }
    return new TextEncoder().encode(secret);
}

function createCsrfToken() {
    return randomBytes(32).toString('base64url');
}

export async function ensureCsrfToken() {
    const cookieStore = await cookies();
    const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    if (existing) {
        return existing;
    }

    const csrfToken = createCsrfToken();
    cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });
    return csrfToken;
}

export async function signIn(username: string, password: string): Promise<boolean> {
    const db = getDb();
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as AdminUser | undefined;

    if (!user) return false;

    if (!verifyPassword(password, user.password_hash)) return false;

    const token = await new SignJWT({ userId: user.id, username: user.username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(getJwtSecret());

    const csrfToken = createCsrfToken();

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
    cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    return true;
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete(CSRF_COOKIE_NAME);
}

export async function getSession(): Promise<{ userId: number; username: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return {
            userId: payload.userId as number,
            username: payload.username as string,
        };
    } catch {
        return null;
    }
}

export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function requireAdminRequest(request: NextRequest) {
    const session = await requireAuth();
    const cookieStore = await cookies();
    const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    if (!hasSameOrigin(request) || !csrfCookie || csrfCookie !== csrfHeader) {
        throw new Error('Invalid CSRF token');
    }

    return session;
}

function hasSameOrigin(request: NextRequest) {
    const expectedOrigin = new URL(request.url).origin;
    const origin = request.headers.get('origin');
    if (origin) {
        return origin === expectedOrigin;
    }

    const referer = request.headers.get('referer');
    if (!referer) {
        return false;
    }

    try {
        return new URL(referer).origin === expectedOrigin;
    } catch {
        return false;
    }
}
