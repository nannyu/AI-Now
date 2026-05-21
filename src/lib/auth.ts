import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDb } from './db';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'ai-now-secret-key-change-in-production'
);

const COOKIE_NAME = 'ainow-admin-token';

export async function signIn(username: string, password: string): Promise<boolean> {
    const db = getDb();
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;

    if (!user) return false;

    // Simple password check - in production use bcrypt
    if (user.password_hash !== password) return false;

    // Create JWT token
    const token = await new SignJWT({ userId: user.id, username: user.username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });

    return true;
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ userId: number; username: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
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
