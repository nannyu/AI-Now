'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        fetch('/api/admin/session')
            .then((res) => {
                if (res.ok) {
                    setAuthenticated(true);
                } else {
                    router.push('/admin/login');
                }
            })
            .catch(() => router.push('/admin/login'));
    }, [router]);

    if (authenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-neutral-500">Loading...</p>
            </div>
        );
    }

    return <AdminDashboard />;
}
