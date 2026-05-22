import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import { getDb } from './db';
import { isPostgresEnabled, pgQuery } from './postgres';
import { hashPassword, verifyPassword } from './password';

const COOKIE_NAME = 'ainow-admin-token';
const READER_COOKIE_NAME = 'ainow-reader-token';
const CSRF_COOKIE_NAME = 'ainow-admin-csrf';

type AdminUser = {
    id: number;
    username: string;
    password_hash: string;
};

type ReaderUser = {
    id: number;
    username: string;
    email: string;
    password_hash: string;
};

type ReaderIdentityConflict = 'username' | 'email';

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

async function setReaderCookie(user: { id: number; username: string; email: string }) {
    const token = await new SignJWT({
        readerUserId: user.id,
        username: user.username,
        email: user.email,
        role: 'reader',
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(getJwtSecret());

    const cookieStore = await cookies();
    cookieStore.set(READER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    });
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
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<AdminUser>('SELECT * FROM admin_users WHERE username = $1', [username]);
        const user = rows[0];
        if (!user || !verifyPassword(password, user.password_hash)) return false;

        const token = await new SignJWT({ userId: Number(user.id), username: user.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(getJwtSecret());

        const csrfToken = createCsrfToken();
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
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

export async function findReaderIdentityConflict(input: {
    username: string;
    email: string;
    excludeUserId?: number;
}): Promise<ReaderIdentityConflict | null> {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();
    const excludeUserId = input.excludeUserId ?? null;

    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<{ field: ReaderIdentityConflict }>(
            `
                SELECT 'username' AS field
                FROM admin_users
                WHERE lower(username) = lower($1)
                UNION ALL
                SELECT 'username' AS field
                FROM reader_users
                WHERE lower(username) = lower($1)
                  AND ($3::bigint IS NULL OR id <> $3::bigint)
                UNION ALL
                SELECT 'email' AS field
                FROM reader_users
                WHERE lower(email) = lower($2)
                  AND ($3::bigint IS NULL OR id <> $3::bigint)
                LIMIT 1
            `,
            [username, email, excludeUserId]
        );
        return rows[0]?.field ?? null;
    }

    const db = getDb();
    const usernameConflict =
        db.prepare('SELECT id FROM admin_users WHERE lower(username) = lower(?)').get(username) ||
        db.prepare(`
            SELECT id
            FROM reader_users
            WHERE lower(username) = lower(?)
              AND (? IS NULL OR id <> ?)
        `).get(username, excludeUserId, excludeUserId);
    if (usernameConflict) {
        return 'username';
    }

    const emailConflict = db.prepare(`
        SELECT id
        FROM reader_users
        WHERE lower(email) = lower(?)
          AND (? IS NULL OR id <> ?)
    `).get(email, excludeUserId, excludeUserId);
    return emailConflict ? 'email' : null;
}

export async function registerReaderUser(username: string, email: string, password: string) {
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const conflict = await findReaderIdentityConflict({
        username: normalizedUsername,
        email: normalizedEmail,
    });
    if (conflict) {
        throw new Error(conflict === 'email' ? 'EMAIL_TAKEN' : 'USERNAME_TAKEN');
    }

    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<{ id: string; username: string; email: string }>(
            `
                INSERT INTO reader_users (username, email, password_hash)
                VALUES ($1, $2, $3)
                RETURNING id, username, email
            `,
            [normalizedUsername, normalizedEmail, hashPassword(password)]
        );
        return {
            id: Number(rows[0].id),
            username: rows[0].username,
            email: rows[0].email,
        };
    }

    const db = getDb();

    const result = db.prepare(`
        INSERT INTO reader_users (username, email, password_hash)
        VALUES (?, ?, ?)
    `).run(normalizedUsername, normalizedEmail, hashPassword(password));

    return {
        id: Number(result.lastInsertRowid),
        username: normalizedUsername,
        email: normalizedEmail,
    };
}

export async function signInReader(usernameOrEmail: string, password: string): Promise<boolean> {
    const identifier = usernameOrEmail.trim();
    if (isPostgresEnabled()) {
        const { rows } = await pgQuery<ReaderUser>(
            `
                SELECT *
                FROM reader_users
                WHERE username = $1 OR email = $2
            `,
            [identifier, identifier.toLowerCase()]
        );
        const user = rows[0];
        if (!user || !verifyPassword(password, user.password_hash)) return false;

        await setReaderCookie({
            id: Number(user.id),
            username: user.username,
            email: user.email,
        });
        return true;
    }

    const db = getDb();
    const user = db.prepare(`
        SELECT *
        FROM reader_users
        WHERE username = ? OR email = ?
    `).get(identifier, identifier.toLowerCase()) as ReaderUser | undefined;

    if (!user) return false;
    if (!verifyPassword(password, user.password_hash)) return false;

    await setReaderCookie(user);

    return true;
}

export async function refreshReaderSession(user: { id: number; username: string; email: string }) {
    await setReaderCookie(user);
}

export async function signOutReader() {
    const cookieStore = await cookies();
    cookieStore.delete(READER_COOKIE_NAME);
}

export async function getReaderSession(): Promise<{ userId: number; username: string; email: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(READER_COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        if (payload.role !== 'reader') return null;
        return {
            userId: Number(payload.readerUserId),
            username: payload.username as string,
            email: payload.email as string,
        };
    } catch {
        return null;
    }
}

export async function requireReaderRequest(request: NextRequest) {
    const session = await getReaderSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    if (!hasSameOrigin(request)) {
        throw new Error('Invalid request origin');
    }
    return session;
}

export async function getSession(): Promise<{ userId: number; username: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return {
            userId: Number(payload.userId),
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
