'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Rss, LogOut } from 'lucide-react';
import { SourcesPanel } from './SourcesPanel';
import { ArticlesPanel } from './ArticlesPanel';
import { adminFetch } from '@/lib/admin-api-client';
import clsx from 'clsx';

type Tab = 'articles' | 'sources';

export function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('articles');

    const handleLogout = async () => {
        await adminFetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    const tabs = [
        { id: 'articles' as Tab, label: 'Articles', icon: FileText },
        { id: 'sources' as Tab, label: 'RSS Sources', icon: Rss },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
                <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">AI</span>
                        </div>
                        <div>
                            <span className="text-sm font-bold text-neutral-900">AI Now</span>
                            <p className="text-xs text-neutral-500">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                activeTab === tab.id
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'text-neutral-600 hover:bg-neutral-50'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl">
                    {activeTab === 'articles' && <ArticlesPanel />}
                    {activeTab === 'sources' && <SourcesPanel />}
                </div>
            </main>
        </div>
    );
}
