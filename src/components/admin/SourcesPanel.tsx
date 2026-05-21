'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight, Rss } from 'lucide-react';

interface Source {
    id: number;
    name: string;
    feed_url: string;
    is_active: number;
    last_fetched_at: string | null;
    created_at: string;
}

export function SourcesPanel() {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [fetching, setFetching] = useState<number | null>(null);
    const [fetchResult, setFetchResult] = useState<string | null>(null);

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
    }, []);

    const addSource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newUrl) return;

        const res = await fetch('/api/admin/sources', {
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
        if (!confirm('Delete this source?')) return;
        await fetch(`/api/admin/sources?id=${id}`, { method: 'DELETE' });
        loadSources();
    };

    const toggleSource = async (id: number, currentActive: number) => {
        await fetch('/api/admin/sources', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: !currentActive }),
        });
        loadSources();
    };

    const fetchSource = async (id: number) => {
        setFetching(id);
        setFetchResult(null);

        try {
            const res = await fetch('/api/admin/fetch-source', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source_id: id }),
            });

            const data = await res.json();
            if (res.ok) {
                setFetchResult(`Fetched ${data.total} articles: ${data.ingested} new, ${data.skipped} skipped`);
            } else {
                setFetchResult(`Error: ${data.error}`);
            }
        } catch (err: any) {
            setFetchResult(`Error: ${err.message}`);
        } finally {
            setFetching(null);
            loadSources();
        }
    };

    if (loading) return <p className="text-neutral-500">Loading sources...</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">RSS Sources</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Configure wechat-rss-lite data sources to crawl articles from.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Source
                </button>
            </div>

            {/* Add source form */}
            {showAdd && (
                <form onSubmit={addSource} className="mb-6 p-4 bg-white rounded-xl border border-neutral-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Source Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. 36Kr AI"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Feed URL</label>
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
                            Save
                        </button>
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100">
                            Cancel
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
                    <p className="text-neutral-500">No sources configured yet.</p>
                    <p className="text-sm text-neutral-400 mt-1">Add a wechat-rss-lite feed URL to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sources.map((source) => (
                        <div key={source.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-neutral-900">{source.name}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${source.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                        {source.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-500 truncate mt-0.5">{source.feed_url}</p>
                                {source.last_fetched_at && (
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        Last fetched: {new Date(source.last_fetched_at).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => fetchSource(source.id)}
                                    disabled={fetching === source.id}
                                    className="p-2 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Fetch articles"
                                >
                                    <RefreshCw className={`w-4 h-4 ${fetching === source.id ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={() => toggleSource(source.id, source.is_active)}
                                    className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg transition-colors"
                                    title={source.is_active ? 'Disable' : 'Enable'}
                                >
                                    {source.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => deleteSource(source.id)}
                                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
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
