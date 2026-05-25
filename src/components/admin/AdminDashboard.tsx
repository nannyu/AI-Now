'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Rss, LogOut, MessageCircle, Home } from 'lucide-react';
import { SourcesPanel } from './SourcesPanel';
import { ArticlesPanel } from './ArticlesPanel';
import { WeChatRssPanel } from './WeChatRssPanel';
import { adminFetch } from '@/lib/admin-api-client';
import clsx from 'clsx';

type Tab = 'articles' | 'sources' | 'wechat-rss';

export function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('articles');

    const handleLogout = async () => {
        await adminFetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    const tabs = [
        { id: 'articles' as Tab, label: '文章管理', icon: FileText },
        { id: 'wechat-rss' as Tab, label: '公众号采集', icon: MessageCircle },
        { id: 'sources' as Tab, label: 'RSS 来源', icon: Rss },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
            {/* Sidebar */}
            <aside className="w-full lg:w-60 xl:w-64 bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col shrink-0">
                <div className="p-4 lg:p-6 border-b border-neutral-100 space-y-3">
                    <a
                        href="/zh"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-brand-600 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        回到首页
                    </a>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">AI</span>
                        </div>
                        <div>
                            <span className="text-sm font-bold text-neutral-900">AI Now</span>
                            <p className="text-xs text-neutral-500">后台管理</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-3 lg:p-4 flex lg:block gap-2 overflow-x-auto lg:space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                'shrink-0 lg:w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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

                <div className="p-3 lg:p-4 border-t border-neutral-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        退出登录
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className={clsx(
                'flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden',
                activeTab === 'wechat-rss' && 'overflow-hidden'
            )}>
                <div className={activeTab === 'wechat-rss' ? 'h-full max-w-none min-w-0' : 'w-full max-w-6xl min-w-0'}>
                    {activeTab === 'articles' && <ArticlesPanel />}
                    {activeTab === 'wechat-rss' && <WeChatRssPanel />}
                    {activeTab === 'sources' && <SourcesPanel />}
                </div>
            </main>
        </div>
    );
}
