'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';

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

interface Props {
    article: Article;
    onSave: (article: Article) => void;
    onCancel: () => void;
}

export function ArticleEditor({ article, onSave, onCancel }: Props) {
    const [form, setForm] = useState({ ...article });
    const [showPreview, setShowPreview] = useState(false);
    const previewSrcDoc = useMemo(() => {
        return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; color: #171717; font-family: Georgia, serif; line-height: 1.75; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    a { color: #2563eb; }
    blockquote { border-left: 3px solid #d4d4d4; margin-left: 0; padding-left: 1rem; color: #525252; }
    h2, h3, h4 { font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.25; }
  </style>
</head>
<body>${form.body}</body>
</html>`;
    }, [form.body]);

    const handleChange = (field: keyof Article, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-neutral-900">Edit Article</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            {showPreview ? (
                /* Preview mode */
                <div className="bg-white rounded-xl border border-neutral-200 p-8">
                    {form.cover_image && (
                        <div className="aspect-[16/9] rounded-xl overflow-hidden mb-6 max-w-3xl">
                            <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="max-w-[680px]">
                        <h1 className="text-3xl font-bold text-neutral-900 mb-3">{form.title}</h1>
                        <p className="text-lg text-neutral-600 mb-4">{form.summary}</p>
                        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-8 pb-6 border-b border-neutral-200">
                            <span className="font-medium text-neutral-700">{form.author}</span>
                            {form.category && <span>· {form.category}</span>}
                        </div>
                        <iframe
                            title="Article preview"
                            sandbox=""
                            srcDoc={previewSrcDoc}
                            className="w-full min-h-[520px] border-0"
                        />
                    </div>
                </div>
            ) : (
                /* Edit mode */
                <div className="space-y-6 bg-white rounded-xl border border-neutral-200 p-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Summary</label>
                        <textarea
                            value={form.summary}
                            onChange={(e) => handleChange('summary', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                        />
                    </div>

                    {/* Two columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Author</label>
                            <input
                                type="text"
                                value={form.author}
                                onChange={(e) => handleChange('author', e.target.value)}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Cover Image URL</label>
                        <input
                            type="text"
                            value={form.cover_image}
                            onChange={(e) => handleChange('cover_image', e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        {form.cover_image && (
                            <div className="mt-2 w-48 aspect-[16/9] rounded-lg overflow-hidden bg-neutral-100">
                                <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Featured toggle */}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_featured === 1}
                                onChange={(e) => handleChange('is_featured', e.target.checked ? 1 : 0)}
                                className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                            />
                            <span className="text-sm font-medium text-neutral-700">Featured article</span>
                        </label>
                    </div>

                    {/* Body (HTML) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Body (HTML)
                        </label>
                        <textarea
                            value={form.body}
                            onChange={(e) => handleChange('body', e.target.value)}
                            rows={20}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
