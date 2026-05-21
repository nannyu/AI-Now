'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

type ServiceStatus = {
    base_url: string;
    proxy_path: string;
    online: boolean;
    has_server_token: boolean;
    upstream_token_configured: boolean;
    ready_for_login: boolean;
    auth_detail: string | null;
    error: string | null;
};

export function WeChatRssPanel() {
    const [status, setStatus] = useState<ServiceStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStatus = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/wechat-rss/status');
            if (res.ok) {
                setStatus(await res.json());
            } else {
                setStatus(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    const adminFrameSrc = '/api/admin/wechat-rss/admin';
    const showTokenWarning =
        status?.online && (!status.has_server_token || !status.upstream_token_configured);
    const showAuthWarning = status?.online && status.auth_detail && !status.ready_for_login;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-2 min-w-0 overflow-hidden">
            <div className="mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-neutral-900">微信公众号采集</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    管理扫码登录、公众号订阅与 RSS 输出。需先启动本地 wechat-rss-lite 服务。
                </p>
            </div>

            {(showTokenWarning || showAuthWarning) && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 shrink-0">
                    <p className="font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        扫码登录暂不可用
                    </p>
                    <p className="mt-2 text-amber-800">
                        {showTokenWarning
                            ? '未检测到有效的管理令牌。二维码创建会失败（Admin token required）。'
                            : status?.auth_detail}
                    </p>
                    <p className="mt-2 text-xs text-amber-700">
                        在项目根目录执行{' '}
                        <code className="bg-amber-100 px-1 rounded">npm run wechat-rss:sync-env</code>
                        ，然后重启{' '}
                        <code className="bg-amber-100 px-1 rounded">npm run wechat-rss:dev</code> 与{' '}
                        <code className="bg-amber-100 px-1 rounded">npm run dev</code>。
                    </p>
                </div>
            )}

            <div className="mb-4 p-4 bg-white rounded-xl border border-neutral-200 shrink-0 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 min-w-0">
                    <div className="space-y-1 text-sm min-w-0">
                        {loading ? (
                            <p className="text-neutral-500">正在检测服务状态…</p>
                        ) : status ? (
                            <>
                                <p className="text-neutral-700">
                                    服务地址：<code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded break-all">{status.base_url}</code>
                                </p>
                                <p className="text-neutral-500">
                                    状态：
                                    <span className={status.online ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
                                        {status.online ? '在线' : '离线'}
                                    </span>
                                    {status.ready_for_login && (
                                        <span className="ml-2 text-green-600">（可扫码登录）</span>
                                    )}
                                    {status.has_server_token && !status.ready_for_login && status.online && (
                                        <span className="ml-2 text-neutral-400">（令牌已同步，等待服务重启）</span>
                                    )}
                                </p>
                                {!status.online && status.error && (
                                    <p className="text-amber-700 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {status.error}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-red-600">无法读取服务状态</p>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={loadStatus}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                        >
                            <RefreshCw className="w-4 h-4" />
                            刷新状态
                        </button>
                        {status?.base_url && (
                            <a
                                href={status.base_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-50"
                            >
                                <ExternalLink className="w-4 h-4" />
                                打开独立面板
                            </a>
                        )}
                    </div>
                </div>
                {!loading && status && !status.online && (
                    <p className="mt-3 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
                        在项目根目录运行：<code className="bg-neutral-100 px-1 rounded">npm run wechat-rss:dev</code>
                        （会自动执行 sync-env 生成并同步令牌）
                    </p>
                )}
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <iframe
                    title="公众号采集管理面板"
                    src={adminFrameSrc}
                    className="w-full h-full border-0"
                    allow="clipboard-write"
                />
            </div>
        </div>
    );
}
