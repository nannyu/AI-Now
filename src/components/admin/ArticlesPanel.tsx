'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, Eye, FileText, Pencil, Pin, Plus, RotateCcw, Send, Trash2, Check, X } from 'lucide-react';
import { ArticleEditor } from './ArticleEditor';
import { adminFetch } from '@/lib/admin-api-client';
import { resolveArticleCoverUrl } from '@/lib/image-proxy';
import { formatArticleDate } from '@/lib/format-date';
import { categories, getLocalizedCategoryName } from '@/lib/mock-data';
import clsx from 'clsx';

interface Article {
    id: number;
    slug?: string;
    title: string;
    summary: string;
    body: string;
    author: string;
    cover_image: string;
    category: string;
    status: string;
    is_featured: number;
    publish_date: string | null;
    deleted_at: string | null;
    crawled_at: string;
    updated_at: string;
}

type StatusFilter = 'all' | 'draft' | 'published' | 'rejected' | 'trash';

interface WechatSubscriptionOption {
    id: string;
    title: string;
    enabled: boolean;
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
        ingested?: number;
        skipped?: number;
        errors?: string[];
    };
}

const emptyDraft = {
    title: '',
    summary: '',
    body: '',
    author: '',
    cover_image: '',
    category: 'ai-products',
};

const statusLabels: Record<StatusFilter | string, string> = {
    all: '全部',
    draft: '草稿',
    published: '已发布',
    rejected: '已驳回',
    trash: '回收站',
};

export function ArticlesPanel() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
    const [selectedArticleIds, setSelectedArticleIds] = useState<Set<number>>(new Set());
    const [showCreate, setShowCreate] = useState(false);
    const [draftForm, setDraftForm] = useState(emptyDraft);
    const [showImport, setShowImport] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importLimit, setImportLimit] = useState(20);
    const [refreshHistory, setRefreshHistory] = useState(false);
    const [subscriptions, setSubscriptions] = useState<WechatSubscriptionOption[]>([]);
    const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState<string | null>(null);
    const [activeJob, setActiveJob] = useState<AdminJob | null>(null);

    const loadArticles = useCallback(async (page = 1) => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (statusFilter !== 'all') params.set('status', statusFilter);

        const res = await fetch(`/api/admin/articles?${params}`);
        if (res.ok) {
            const data = await res.json();
            setArticles(data.articles);
            setPagination(data.pagination);
            setSelectedArticleIds(new Set());
        }
        setLoading(false);
    }, [statusFilter]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    useEffect(() => {
        void resumeLatestImportJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateArticleStatus = async (id: number, status: string) => {
        await adminFetch('/api/admin/articles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id,
                status,
            }),
        });
        loadArticles(pagination.page);
    };

    const toggleArticlePin = async (article: Article) => {
        const nextFeatured = article.is_featured === 1 ? 0 : 1;
        const res = await adminFetch('/api/admin/articles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: article.id,
                is_featured: nextFeatured,
            }),
        });
        if (!res.ok) {
            setMessage('置顶操作失败，请重试。');
            return;
        }
        setMessage(nextFeatured ? `已置顶：${article.title}` : `已取消置顶：${article.title}`);
        loadArticles(pagination.page);
    };

    const batchUpdateStatus = async (ids: number[], status: string) => {
        if (ids.length === 0) return;
        await adminFetch('/api/admin/articles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids,
                status,
            }),
        });
        setMessage(`已更新 ${ids.length} 篇文章。`);
        loadArticles(pagination.page);
    };

    const deleteArticle = async (id: number) => {
        if (!confirm('确定要将这篇文章移入回收站吗？文章将在回收站保留 30 天。')) return;
        await adminFetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
        setMessage('文章已移入回收站，将在 30 天后自动清除。');
        loadArticles(pagination.page);
    };

    const batchDeleteArticles = async (ids: number[]) => {
        if (ids.length === 0) return;
        if (!confirm(`确定要将 ${ids.length} 篇文章移入回收站吗？文章将在回收站保留 30 天。`)) return;
        await adminFetch(`/api/admin/articles?ids=${ids.join(',')}`, { method: 'DELETE' });
        setMessage(`已将 ${ids.length} 篇文章移入回收站。`);
        loadArticles(pagination.page);
    };

    const handleSaveArticle = async (article: Article) => {
        await adminFetch('/api/admin/articles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: article.id,
                title: article.title,
                summary: article.summary,
                body: article.body,
                author: article.author,
                cover_image: article.cover_image,
                category: article.category,
                is_featured: article.is_featured,
                publish_date: article.publish_date,
            }),
        });
        setEditingArticle(null);
        loadArticles(pagination.page);
    };

    const createArticle = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!draftForm.title.trim()) {
            setMessage('请填写标题。');
            return;
        }

        const res = await adminFetch('/api/admin/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draftForm),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            setMessage(data?.error || '新建文章失败。');
            return;
        }

        setDraftForm(emptyDraft);
        setShowCreate(false);
        setMessage('草稿已创建。');
        loadArticles(1);
    };

    const loadWechatSubscriptions = async () => {
        setImportLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/wechat-rss/subscriptions');
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.error || '加载公众号订阅失败。');
                return;
            }
            const enabled = (Array.isArray(data) ? data : data.subscriptions).filter(
                (item: WechatSubscriptionOption) => item.enabled !== false
            );
            setSubscriptions(enabled);
            setSelectedSubscriptions(new Set(enabled.map((item: WechatSubscriptionOption) => item.id)));
            setShowImport(true);
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : '加载公众号订阅失败。');
        } finally {
            setImportLoading(false);
        }
    };

    const importWechatArticles = async () => {
        const subscriptionIds = Array.from(selectedSubscriptions);
        if (subscriptionIds.length === 0) {
            setMessage('请至少选择一个公众号订阅。');
            return;
        }

        setImportLoading(true);
        setMessage(null);
        try {
            const res = await adminFetch('/api/admin/wechat-rss/import-articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription_ids: subscriptionIds,
                    limit: importLimit,
                    refresh_history: refreshHistory,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.error || '导入失败。');
                return;
            }
            const job = data.job as AdminJob | undefined;
            if (job?.id) {
                setActiveJob(job);
                setMessage('导入任务已在后台开始，可以切换页面，任务会继续执行。');
                setShowImport(false);
                void pollAdminJob(job.id, (doneJob) => {
                    const ingested = doneJob.result?.ingested ?? doneJob.succeeded;
                    const skipped = doneJob.result?.skipped ?? 0;
                    setMessage(
                        doneJob.status === 'succeeded'
                            ? `导入完成：新增 ${ingested} 篇草稿，跳过 ${skipped} 篇重复文章。`
                            : `导入失败：${doneJob.error || doneJob.message}`
                    );
                    loadArticles(1);
                });
                return;
            }
            setMessage('导入任务已提交。');
            setShowImport(false);
            loadArticles(1);
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : '导入失败。');
        } finally {
            setImportLoading(false);
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

    const resumeLatestImportJob = async () => {
        const res = await fetch('/api/admin/jobs?limit=10', { credentials: 'same-origin' });
        if (!res.ok) return;
        const jobs = await res.json() as AdminJob[];
        const job = jobs.find((item) => item.type === 'wechat-articles.import' && !['succeeded', 'failed'].includes(item.status));
        if (!job) return;
        setActiveJob(job);
        void pollAdminJob(job.id, (doneJob) => {
            const ingested = doneJob.result?.ingested ?? doneJob.succeeded;
            const skipped = doneJob.result?.skipped ?? 0;
            setMessage(
                doneJob.status === 'succeeded'
                    ? `导入完成：新增 ${ingested} 篇草稿，跳过 ${skipped} 篇重复文章。`
                    : `导入失败：${doneJob.error || doneJob.message}`
            );
            loadArticles(1);
        });
    };

    const toggleArticle = (id: number) => {
        setSelectedArticleIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectCurrentPageArticles = () => {
        setSelectedArticleIds(new Set(articles.map((article) => article.id)));
    };

    const invertCurrentPageSelection = () => {
        setSelectedArticleIds((prev) => {
            const next = new Set<number>();
            for (const article of articles) {
                if (!prev.has(article.id)) {
                    next.add(article.id);
                }
            }
            return next;
        });
    };

    const toggleSubscription = (id: string) => {
        setSelectedSubscriptions((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (editingArticle) {
        return (
            <ArticleEditor
                article={editingArticle}
                onSave={handleSaveArticle}
                onCancel={() => setEditingArticle(null)}
            />
        );
    }

    const statusColors: Record<string, string> = {
        draft: 'bg-yellow-100 text-yellow-700',
        published: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        trash: 'bg-neutral-200 text-neutral-600',
    };
    const selectedIds = Array.from(selectedArticleIds);
    const selectedDraftIds = articles
        .filter((article) => selectedArticleIds.has(article.id) && article.status === 'draft')
        .map((article) => article.id);
    const selectedPublishedIds = articles
        .filter((article) => selectedArticleIds.has(article.id) && article.status === 'published')
        .map((article) => article.id);
    const selectedTrashIds = articles
        .filter((article) => selectedArticleIds.has(article.id) && article.status === 'trash')
        .map((article) => article.id);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-neutral-900">文章管理</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        管理抓取与手工创建的文章，支持编辑、发布、撤回、回收站和恢复。
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowCreate((value) => !value)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        新建草稿
                    </button>
                    <button
                        type="button"
                        onClick={loadWechatSubscriptions}
                        disabled={importLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        导入公众号文章
                    </button>
                </div>
            </div>

            {message && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    {message}
                </div>
            )}

            {activeJob && (
                <JobProgress job={activeJob} />
            )}

            {showCreate && (
                <form onSubmit={createArticle} className="mb-6 p-4 bg-white rounded-xl border border-neutral-200">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">创建草稿文章</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            value={draftForm.title}
                            onChange={(e) => setDraftForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="标题"
                            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        />
                        <input
                            value={draftForm.author}
                            onChange={(e) => setDraftForm((prev) => ({ ...prev, author: e.target.value }))}
                            placeholder="作者"
                            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        />
                        <select
                            value={draftForm.category}
                            onChange={(e) => setDraftForm((prev) => ({ ...prev, category: e.target.value }))}
                            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        >
                            {categories.map((category) => (
                                <option key={category.slug} value={category.slug}>
                                    {getLocalizedCategoryName(category, 'zh')}
                                </option>
                            ))}
                        </select>
                        <input
                            value={draftForm.cover_image}
                            onChange={(e) => setDraftForm((prev) => ({ ...prev, cover_image: e.target.value }))}
                            placeholder="封面图片 URL"
                            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        />
                    </div>
                    <textarea
                        value={draftForm.summary}
                        onChange={(e) => setDraftForm((prev) => ({ ...prev, summary: e.target.value }))}
                        placeholder="摘要"
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm mb-4 resize-none"
                    />
                    <textarea
                        value={draftForm.body}
                        onChange={(e) => setDraftForm((prev) => ({ ...prev, body: e.target.value }))}
                        placeholder="正文 HTML 或纯文本"
                        rows={8}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono mb-4"
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg">
                            保存到草稿箱
                        </button>
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100">
                            取消
                        </button>
                    </div>
                </form>
            )}

            {showImport && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-neutral-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <h2 className="text-sm font-semibold text-neutral-900">导入公众号订阅文章</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                            <label className="flex items-center gap-2">
                                数量
                                <input
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={importLimit}
                                    onChange={(e) => setImportLimit(Number(e.target.value))}
                                    className="w-20 px-2 py-1 border border-neutral-300 rounded-md text-sm"
                                />
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={refreshHistory}
                                    onChange={(e) => setRefreshHistory(e.target.checked)}
                                />
                                先拉取历史文章
                            </label>
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                        {subscriptions.map((subscription) => (
                            <label key={subscription.id} className="flex items-center gap-3 p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedSubscriptions.has(subscription.id)}
                                    onChange={() => toggleSubscription(subscription.id)}
                                />
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-neutral-900">{subscription.title}</span>
                                    <span className="block text-xs text-neutral-500 truncate">{subscription.id}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={importWechatArticles}
                            disabled={importLoading}
                            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                        >
                            导入选中项
                        </button>
                        <button type="button" onClick={() => setShowImport(false)} className="px-4 py-2 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100">
                            取消
                        </button>
                    </div>
                </div>
            )}

            {/* Status filter tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 rounded-lg w-full sm:w-fit">
                    {(['all', 'draft', 'published', 'rejected', 'trash'] as StatusFilter[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={clsx(
                                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                                statusFilter === status
                                    ? 'bg-white text-neutral-900 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            )}
                        >
                            {statusLabels[status]}
                        </button>
                    ))}
                </div>
                {articles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <button
                            type="button"
                            onClick={selectCurrentPageArticles}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50"
                        >
                            全选当前页
                        </button>
                        <button
                            type="button"
                            onClick={invertCurrentPageSelection}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50"
                        >
                            反选当前页
                        </button>
                    </div>
                )}
                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-neutral-500">已选择 {selectedIds.length} 篇</span>
                        {selectedDraftIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => batchUpdateStatus(selectedDraftIds, 'published')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                            >
                                <Send className="w-4 h-4" />
                                批量发布草稿
                            </button>
                        )}
                        {selectedPublishedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => batchUpdateStatus(selectedPublishedIds, 'draft')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100"
                            >
                                <RotateCcw className="w-4 h-4" />
                                批量撤回草稿
                            </button>
                        )}
                        {selectedTrashIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => batchUpdateStatus(selectedTrashIds, 'draft')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                            >
                                <RotateCcw className="w-4 h-4" />
                                批量恢复到草稿箱
                            </button>
                        )}
                        {selectedTrashIds.length !== selectedIds.length && (
                            <button
                                type="button"
                                onClick={() => batchDeleteArticles(selectedIds.filter((id) => !selectedTrashIds.includes(id)))}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                            >
                                <Trash2 className="w-4 h-4" />
                                批量移入回收站
                            </button>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <p className="text-neutral-500">正在加载文章...</p>
            ) : articles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                    <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">{statusFilter === 'trash' ? '回收站为空。' : '暂无文章。'}</p>
                    <p className="text-sm text-neutral-400 mt-1">
                        {statusFilter === 'trash' ? '删除的文章会在这里保留 30 天。' : '可以从公众号订阅或 RSS 来源导入文章。'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {articles.map((article) => (
                            <div key={article.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors min-w-0">
                                <input
                                    type="checkbox"
                                    checked={selectedArticleIds.has(article.id)}
                                    onChange={() => toggleArticle(article.id)}
                                    className="shrink-0 self-start sm:self-center"
                                />
                                {/* Thumbnail */}
                                {article.cover_image && (
                                    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                                        <img
                                            src={resolveArticleCoverUrl(article.cover_image)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                {article.status === 'draft' ? (
                                    <button
                                        type="button"
                                        onClick={() => setEditingArticle(article)}
                                        className="w-full sm:flex-1 min-w-0 text-left cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        title="编辑草稿"
                                    >
                                        <ArticleSummary article={article} statusColors={statusColors} />
                                    </button>
                                ) : (
                                    <div className="w-full sm:flex-1 min-w-0">
                                        <ArticleSummary article={article} statusColors={statusColors} />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-1 shrink-0 self-start sm:self-center">
                                    {article.status === 'draft' && (
                                        <button
                                            onClick={() => updateArticleStatus(article.id, 'published')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="发布"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    {article.status === 'draft' && (
                                        <button
                                            onClick={() => updateArticleStatus(article.id, 'rejected')}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="驳回"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    {article.status === 'published' && (
                                        <button
                                            onClick={() => updateArticleStatus(article.id, 'draft')}
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="撤回为草稿"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    )}
                                    {article.status === 'published' && (
                                        <button
                                            type="button"
                                            onClick={() => toggleArticlePin(article)}
                                            className={clsx(
                                                'p-2 rounded-lg transition-colors',
                                                article.is_featured === 1
                                                    ? 'text-brand-700 bg-brand-50 hover:bg-brand-100'
                                                    : 'text-neutral-500 hover:text-brand-600 hover:bg-brand-50'
                                            )}
                                            title={article.is_featured === 1 ? '取消置顶' : '置顶'}
                                        >
                                            <Pin className={clsx('w-4 h-4', article.is_featured === 1 && 'fill-current')} />
                                        </button>
                                    )}
                                    {article.status === 'trash' ? (
                                        <button
                                            onClick={() => updateArticleStatus(article.id, 'draft')}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="恢复到草稿箱"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => window.open(`/zh/article/${article.slug || `db-${article.id}`}`, '_blank', 'noopener,noreferrer')}
                                                className="p-2 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="打开文章"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingArticle(article)}
                                                className="p-2 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="编辑"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteArticle(article.id)}
                                                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="移入回收站"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
                            <p className="text-sm text-neutral-500">
                                第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 篇
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => loadArticles(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg disabled:opacity-50 hover:bg-neutral-50"
                                >
                                    上一页
                                </button>
                                <button
                                    onClick={() => loadArticles(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg disabled:opacity-50 hover:bg-neutral-50"
                                >
                                    下一页
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function JobProgress({ job }: { job: AdminJob }) {
    const total = Math.max(job.total || 0, 0);
    const processed = Math.max(job.processed || 0, 0);
    const percent = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : (job.status === 'succeeded' ? 100 : 0);
    const isDone = job.status === 'succeeded' || job.status === 'failed';

    return (
        <div className="mb-4 p-4 bg-white border border-neutral-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                    <p className="text-sm font-semibold text-neutral-900">{job.label}</p>
                    <p className="text-xs text-neutral-500">{job.error || job.message || '后台任务运行中'}</p>
                </div>
                <span className={clsx(
                    'text-xs px-2 py-1 rounded-full w-fit',
                    job.status === 'failed' ? 'bg-red-50 text-red-700' :
                        job.status === 'succeeded' ? 'bg-green-50 text-green-700' :
                            'bg-blue-50 text-blue-700'
                )}>
                    {job.status === 'running' ? '运行中' : job.status === 'succeeded' ? '已完成' : job.status === 'failed' ? '失败' : '排队中'}
                </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className={clsx('h-full transition-all', job.status === 'failed' ? 'bg-red-500' : 'bg-brand-600')} style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
                已处理 {processed}/{total || '-'}，成功 {job.succeeded}，失败 {job.failed}{isDone ? '' : '。可离开当前页面，任务会继续执行。'}
            </p>
        </div>
    );
}

function ArticleSummary({
    article,
    statusColors,
}: {
    article: Article;
    statusColors: Record<string, string>;
}) {
    const displayDate = article.status === 'trash'
        ? article.deleted_at || article.updated_at
        : article.publish_date || article.crawled_at;
    const category = categories.find((item) => item.slug === article.category || item.name === article.category);
    const categoryName = category ? getLocalizedCategoryName(category, 'zh') : article.category;

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                <h3 className="text-sm font-semibold text-neutral-900 truncate min-w-0 max-w-full">
                    {article.title}
                </h3>
                <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full ${statusColors[article.status] || 'bg-neutral-100 text-neutral-500'}`}>
                    {statusLabels[article.status] || article.status}
                </span>
                {article.is_featured === 1 && (
                    <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700">
                        置顶
                    </span>
                )}
            </div>
            <p className="text-xs text-neutral-500 truncate">{article.summary}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-neutral-400">
                <span className="truncate max-w-full">{article.author}</span>
                {categoryName && <span>· {categoryName}</span>}
                {displayDate && (
                    <span>
                        · {article.status === 'trash' ? '删除于 ' : ''}
                        {formatArticleDate(displayDate, 'zh')}
                    </span>
                )}
            </div>
        </>
    );
}
