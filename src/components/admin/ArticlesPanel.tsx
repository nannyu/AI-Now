'use client';

import { useEffect, useState } from 'react';
import { FileText, Eye, Pencil, Trash2, Check, X } from 'lucide-react';
import { ArticleEditor } from './ArticleEditor';
import clsx from 'clsx';

interface Article {
    id: number;
    title: string;
    summary: string;
    body: string;
    author: string;
    cover_image: string;
    category: string;
    status: string;
    is_featured: number;
    publish_date: string;
    crawled_at: string;
    updated_at: string;
}

type StatusFilter = 'all' | 'draft' | 'published' | 'rejected';

export function ArticlesPanel() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

    const loadArticles = async (page = 1) => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (statusFilter !== 'all') params.set('status', statusFilter);

        const res = await fetch(`/api/admin/articles?${params}`);
        if (res.ok) {
            const data = await res.json();
            setArticles(data.articles);
            setPagination(data.pagination);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadArticles();
    }, [statusFilter]);

    const updateArticleStatus = async (id: number, status: string) => {
        await fetch('/api/admin/articles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id,
                status,
                ...(status === 'published' ? { publish_date: new Date().toISOString() } : {}),
            }),
        });
        loadArticles(pagination.page);
    };

    const deleteArticle = async (id: number) => {
        if (!confirm('Delete this article permanently?')) return;
        await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
        loadArticles(pagination.page);
    };

    const handleSaveArticle = async (article: Article) => {
        await fetch('/api/admin/articles', {
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
            }),
        });
        setEditingArticle(null);
        loadArticles(pagination.page);
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
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Articles</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage crawled articles. Edit, publish, or reject content.
                    </p>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1 mb-6 p-1 bg-neutral-100 rounded-lg w-fit">
                {(['all', 'draft', 'published', 'rejected'] as StatusFilter[]).map((status) => (
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
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-neutral-500">Loading articles...</p>
            ) : articles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                    <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">No articles found.</p>
                    <p className="text-sm text-neutral-400 mt-1">Fetch articles from your RSS sources to get started.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {articles.map((article) => (
                            <div key={article.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors">
                                {/* Thumbnail */}
                                {article.cover_image && (
                                    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                                        <img src={article.cover_image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-semibold text-neutral-900 truncate">
                                            {article.title}
                                        </h3>
                                        <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full ${statusColors[article.status] || 'bg-neutral-100 text-neutral-500'}`}>
                                            {article.status}
                                        </span>
                                        {article.is_featured === 1 && (
                                            <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-500 truncate">{article.summary}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                                        <span>{article.author}</span>
                                        {article.category && <span>· {article.category}</span>}
                                        <span>· {new Date(article.crawled_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {article.status === 'draft' && (
                                        <button
                                            onClick={() => updateArticleStatus(article.id, 'published')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Publish"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    {article.status === 'draft' && (
                                        <button
                                            onClick={() => updateArticleStatus(article.id, 'rejected')}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Reject"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditingArticle(article)}
                                        className="p-2 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteArticle(article.id)}
                                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-neutral-500">
                                Page {pagination.page} of {pagination.totalPages} ({pagination.total} articles)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => loadArticles(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg disabled:opacity-50 hover:bg-neutral-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => loadArticles(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg disabled:opacity-50 hover:bg-neutral-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
