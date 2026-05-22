import { NextResponse } from 'next/server';
import { signOutReader } from '@/lib/auth';

export async function POST() {
    await signOutReader();
    return NextResponse.json({ authenticated: false });
}
