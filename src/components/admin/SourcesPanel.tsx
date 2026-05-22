'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight, Rss, Download } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api-client';
import { formatArticleDateTime } from '@/lib/format-date';

interface WechatSubscriptionOption {
    id: string;
    title: string;
    feed_url: string;
    enabled: boolean;
}

interface Source {
    id: number;
    name: string;
    feed_url: string;
    is_active: number;
    last_fetched_at: string | null;
    created_at: string;
}

interface AdminJob {
    id: string;
    type: string;
    status: string;
    label: string;
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    message: string;
    error: string;
    result?: {
        added?: number;
        skipped?: number;
        failed?: number;
        errors?: string[];
        total?: number;
        ingested?: number;
    };
}

export function SourcesPanel() {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [fetching, setFetching] = useState<number | null>(null);
    const [fetchResult, setFetchResult] = useState<string | null>(null);
    const [showImport, setShowImport] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importOptions, setImportOptions] = useState<WechatSubscriptionOption[]>([]);
    const [selectedImports, setSelectedImports] = useState<Set<string>>(new Set());
    const [importMessage, setImportMessage] = useState<string | null>(null);
    const [activeJob, setActiveJob] = useState<AdminJob | null>(null);

    const loadSources = async () => {
        const res = await fetch('/api/admin/sources');
        if (res.ok) {
            const data = await res.json();
            setSources(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSources();
        void resumeLatestSourceJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addSource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newUrl) return;

        const res = await adminFetch('/api/admin/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, feed_url: newUrl }),
        });

        if (res.ok) {
            setNewName('');
            setNewUrl('');
            setShowAdd(false);
            loadSources();
        }
    };

    const deleteSource = async (id: number) => {
        if (!confirm('确定要删除这个来源吗？')) return;
        await adminFetch(`/api/admin/sources?id=${id}`, { method: 'DELETE' });
        loadSources();
    };

    const toggleSource = async (id: number, currentActive: number) => {
        await adminFetch('/api/admin/sources', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: !currentActive }),
        });
        loadSources();
    };

    const loadWechatSubscriptions = async () => {
        setImportLoading(true);
        setImportMessage(null);
        try {
            const res = await fetch('/api/admin/wechat-rss/subscriptions');
            const data = await res.json();
            if (!res.ok) {
                setImportMessage(data.error || '加载订阅失败');
                setImportOptions([]);
                return;
            }
            const subscriptions = Array.isArray(data) ? data : data.subscriptions;
            const options = (subscriptions as WechatSubscriptionOption[]).filter((item) => item.enabled);
            setImportOptions(options);
            setSelectedImports(new Set(options.map((item) => item.id)));
            setShowImport(true);
            if (options.length === 0) {
                setImportMessage('未找到已启用的公众号订阅。');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '加载订阅失败';
            setImportMessage(message);
        } finally {
            setImportLoading(false);
        }
    };

    const toggleImportSelection = (id: string) => {
        setSelectedImports((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const importSelectedSubscriptions = async () => {
        const selected = importOptions.filter((item) => selectedImports.has(item.id));
        if (selected.length === 0) {
            setImportMessage('请至少选择一个订阅。');
            return;
        }

        setImportLoading(true);
        setImportMessage(null);
        try {
            const res = await adminFetch('/api/admin/sources/import-wechat-subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sources: selected }),
            });
            const data = await res.json().catch(() => null) as { error?: string; job?: AdminJob } | null;
            if (!res.ok || !data?.job?.id) {
                setImportMessage(data?.error || '导入任务创建失败。');
                return;
            }
            setActiveJob(data.job);
            setImportMessage('RSS 来源导入任务已在后台开始，可以切换页面。');
            setShowImport(false);
            void pollAdminJob(data.job.id, (job) => {
                const added = job.result?.added ?? job.succeeded;
                const skipped = job.result?.skipped ?? 0;
                const failed = job.result?.failed ?? job.failed;
                setImportMessage(
                    job.status === 'succeeded'
                        ? `导入完成：新增 ${added} 个来源，跳过 ${skipped} 个重复来源，失败 ${failed} 个。`
                        : `导入失败：${job.error || job.message}`
                );
                loadSources();
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '导入请求失败';
            setImportMessage(message);
        } finally {
            setImportLoading(false);
        }
    };

    const fetchSource = async (id: number) => {
        setFetching(id);
        setFetchResult(null);

        try {
            const res = await adminFetch('/api/admin/fetch-source', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source_id: id, background: true }),
            });

            const data = await res.json();
            if (res.ok) {
                if (data.job?.id) {
                    setActiveJob(data.job);
                    setFetchResult('抓取任务已在后台开始，可以切换页面。');
                    void pollAdminJob(data.job.id, (job) => {
                        const total = job.result?.total ?? job.total;
                        const ingested = job.result?.ingested ?? job.succeeded;
                        setFetchResult(
                            job.status === 'succeeded'
                                ? `已抓取 ${total} 篇文章：新增 ${ingested} 篇，跳过 ${job.result?.skipped ?? 0} 篇。`
                                : `错误：${job.error || job.message}`
                        );
                        loadSources();
                    });
                    return;
                }
                setFetchResult(`已抓取 ${data.total} 篇文章：新增 ${data.ingested} 篇，跳过 ${data.skipped} 篇。`);
            } else {
                setFetchResult(`错误：${data.error}`);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '未知错误';
            setFetchResult(`错误：${message}`);
        } finally {
            setFetching(null);
            loadSources();
        }
    };

    const pollAdminJob = async (jobId: string, onDone?: (job: AdminJob) => void) => {
        for (;;) {
            const res = await fetch(`/api/admin/jobs/${encodeURIComponent(jobId)}`, { credentials: 'same-origin' });
            if (!res.ok) return;
            const job = await res.json() as AdminJob;
            setActiveJob(job);
            if (job.status === 'succeeded' || job.status === 'failed') {
                onDone?.(job);
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    };

    const resumeLatestSourceJob = async () => {
        const res = await fetch('/api/admin/jobs?limit=10', { credentials: 'same-origin' });
        if (!res.ok) return;
        const jobs = await res.json() as AdminJob[];
        const job = jobs.find((item) => (
            ['wechat-subscriptions.import-sources', 'rss-source.fetch'].includes(item.type)
            && !['succeeded', 'failed'].includes(item.status)
        ));
        if (!job) return;
        setActiveJob(job);
        void pollAdminJob(job.id, () => {
            loadSources();
        });
    };

    if (loading) return <p className="text-neutral-500">正在加载来源...</p>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-neutral-900">RSS 来源</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        配置 wechat-rss-lite 数据源，用于抓取和导入文章。
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={loadWechatSubscriptions}
                        disabled={importLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                        <Download className={`w-4 h-4 ${importLoading ? 'animate-pulse' : ''}`} />
                        从公众号订阅导入
                    </button>
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        添加来源
                    </button>
                </div>
            </div>

            {importMessage && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    {importMessage}
                </div>
            )}

            {activeJob && (
                <JobProgress job={activeJob} />
            )}

            {showImport && importOptions.length > 0 && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-neutral-200">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">导入订阅来源</h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {importOptions.map((item) => (
                            <label
                                key={item.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedImports.has(item.id)}
                                    onChange={() => toggleImportSelection(item.id)}
                                    className="mt-1"
                                />
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-neutral-900">{item.title}</span>
                                    <span className="block text-xs text-neutral-500 truncate">{item.feed_url}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={importSelectedSubscriptions}
                            disabled={importLoading}
                            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                        >
                            导入选中项
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowImport(false)}
                            className="px-4 py-2 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100"
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}

            {/* Add source form */}
            {showAdd && (
                <form onSubmit={addSource} className="mb-6 p-4 bg-white rounded-xl border border-neutral-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">来源名称</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="例如：AI闹"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">订阅地址</label>
                            <input
                                type="url"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="http://localhost:3000/feed/..."
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
                            保存
                        </button>
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100">
                            取消
                        </button>
                    </div>
                </form>
            )}

            {/* Fetch result message */}
            {fetchResult && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    {fetchResult}
                </div>
            )}

            {/* Sources list */}
            {sources.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                    <Rss className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">还没有配置来源。</p>
                    <p className="text-sm text-neutral-400 mt-1">添加 wechat-rss-lite feed URL 后即可抓取文章。</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sources.map((source) => (
                        <div key={source.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-xl border border-neutral-200 min-w-0">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold text-neutral-900 truncate min-w-0 max-w-full">{source.name}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${source.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                        {source.is_active ? '已启用' : '已停用'}
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-500 truncate mt-0.5">{source.feed_url}</p>
                                {source.last_fetched_at && (
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        上次抓取：{formatArticleDateTime(source.last_fetched_at, 'zh')}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 sm:ml-4 shrink-0">
                                <button
                                    onClick={() => fetchSource(source.id)}
                                    disabled={fetching === source.id}
                                    className="p-2 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="抓取文章"
                                >
                                    <RefreshCw className={`w-4 h-4 ${fetching === source.id ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={() => toggleSource(source.id, source.is_active)}
                                    className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg transition-colors"
                                    title={source.is_active ? '停用' : '启用'}
                                >
                                    {source.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => deleteSource(source.id)}
                                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="删除"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function JobProgress({ job }: { job: AdminJob }) {
    const total = Math.max(job.total || 0, 0);
    const processed = Math.max(job.processed || 0, 0);
    const percent = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : (job.status === 'succeeded' ? 100 : 0);
    const statusClass = job.status === 'failed'
        ? 'bg-red-50 text-red-700'
        : job.status === 'succeeded'
            ? 'bg-green-50 text-green-700'
            : 'bg-blue-50 text-blue-700';
    const barClass = job.status === 'failed' ? 'bg-red-500' : 'bg-brand-600';

    return (
        <div className="mb-4 p-4 bg-white border border-neutral-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                    <p className="text-sm font-semibold text-neutral-900">{job.label}</p>
                    <p className="text-xs text-neutral-500">{job.error || job.message || '后台任务运行中'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full w-fit ${statusClass}`}>
                    {job.status === 'running' ? '运行中' : job.status === 'succeeded' ? '已完成' : job.status === 'failed' ? '失败' : '排队中'}
                </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${barClass}`} style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
                已处理 {processed}/{total || '-'}，成功 {job.succeeded}，失败 {job.failed}
            </p>
        </div>
    );
}
