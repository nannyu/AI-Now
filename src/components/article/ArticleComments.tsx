'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquarePlus, Quote, Send, UserRound } from 'lucide-react';
import { formatArticleDateTime } from '@/lib/format-date';

type ReaderSession = {
    authenticated: boolean;
    user?: {
        username: string;
        email: string;
    };
};

type ArticleComment = {
    id: number;
    body: string;
    quote: string;
    created_at: string;
    username: string;
};

type Props = {
    articleSlug: string;
    selectedQuote: string;
    onClearQuote: () => void;
};

export function ArticleComments({ articleSlug, selectedQuote, onClearQuote }: Props) {
    const [comments, setComments] = useState<ArticleComment[]>([]);
    const [session, setSession] = useState<ReaderSession>({ authenticated: false });
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [showComposer, setShowComposer] = useState(false);
    const [comment, setComment] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const commentApi = useMemo(
        () => `/api/articles/${encodeURIComponent(articleSlug)}/comments`,
        [articleSlug]
    );

    useEffect(() => {
        fetch('/api/auth/session')
            .then(async (res) => {
                if (!res.ok) return { authenticated: false };
                return res.json();
            })
            .then((data) => setSession(data))
            .catch(() => setSession({ authenticated: false }));

        fetch(commentApi)
            .then((res) => res.json())
            .then((data) => setComments(Array.isArray(data.comments) ? data.comments : []))
            .catch(() => setComments([]));
    }, [commentApi]);

    useEffect(() => {
        if (selectedQuote) {
            setShowComposer(true);
        }
    }, [selectedQuote]);

    const submitAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
        const payload = mode === 'register'
            ? { username, email, password }
            : { username, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setMessage(data.error || '操作失败，请重试。');
                return;
            }
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            setSession(sessionData);
            setPassword('');
            setMessage(mode === 'register' ? '注册成功。' : '登录成功。');
        } catch {
            setMessage('网络异常，请稍后重试。');
        } finally {
            setLoading(false);
        }
    };

    const submitComment = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!comment.trim()) return;
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(commentApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment,
                    quote: selectedQuote,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setMessage(data.error || '评论失败，请重试。');
                return;
            }
            setComments((prev) => [data.comment, ...prev]);
            setComment('');
            setShowComposer(false);
            onClearQuote();
            setMessage('评论已发布。');
        } catch {
            setMessage('网络异常，请稍后重试。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-vintage-bg border border-vintage-border p-3 text-xs">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-vintage-border">
                <h4 className="font-mono-raw font-bold text-[10px] uppercase text-vintage-accent tracking-wider">
                    读者评论
                </h4>
                <button
                    type="button"
                    onClick={() => setShowComposer((value) => !value)}
                    className="inline-flex items-center gap-1 rounded-sm border border-vintage-accent/30 px-2 py-1 text-[10px] font-bold text-vintage-accent hover:bg-vintage-accent/10"
                >
                    <MessageSquarePlus className="h-3 w-3" />
                    添加文章评价
                </button>
            </div>

            <p className="mt-2 text-[10px] leading-relaxed text-vintage-text/55">
                在正文中选中文字即可带入引用；也可以不标注，直接添加整体评价。
            </p>

            {message && (
                <div className="mt-3 rounded-sm border border-vintage-border bg-vintage-panel/50 px-2 py-1.5 text-[10px] text-vintage-text/75">
                    {message}
                </div>
            )}

            {showComposer && (
                <div className="mt-3 rounded-sm border border-vintage-border bg-vintage-panel/30 p-3">
                    {selectedQuote && (
                        <div className="mb-3 rounded-sm border-l-2 border-vintage-accent bg-vintage-bg/80 px-2 py-1.5">
                            <div className="mb-1 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-vintage-accent">
                                <span className="inline-flex items-center gap-1">
                                    <Quote className="h-3 w-3" />
                                    划线标注
                                </span>
                                <button type="button" onClick={onClearQuote} className="text-vintage-text/45 hover:text-vintage-accent">
                                    清除
                                </button>
                            </div>
                            <p className="line-clamp-4 text-[10px] leading-relaxed text-vintage-text/75">
                                {selectedQuote}
                            </p>
                        </div>
                    )}

                    {session.authenticated ? (
                        <form onSubmit={submitComment} className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-vintage-text/60">
                                <UserRound className="h-3 w-3 text-vintage-accent" />
                                以 {session.user?.username} 身份评论
                            </div>
                            <textarea
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                rows={4}
                                maxLength={1200}
                                placeholder="写下你的观察、补充或问题..."
                                className="w-full resize-none rounded-sm border border-vintage-border bg-vintage-bg px-2 py-2 text-xs text-vintage-text outline-none focus:border-vintage-accent"
                            />
                            <button
                                type="submit"
                                disabled={loading || !comment.trim()}
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm bg-vintage-accent px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-vintage-bg disabled:opacity-50"
                            >
                                <Send className="h-3 w-3" />
                                发布评论
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={submitAuth} className="space-y-2">
                            <div className="flex rounded-sm border border-vintage-border bg-vintage-bg p-0.5">
                                {(['login', 'register'] as const).map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setMode(item)}
                                        className={`flex-1 px-2 py-1 text-[10px] font-bold ${mode === item
                                            ? 'bg-vintage-accent text-vintage-bg'
                                            : 'text-vintage-text/60 hover:text-vintage-accent'
                                        }`}
                                    >
                                        {item === 'login' ? '登录' : '注册'}
                                    </button>
                                ))}
                            </div>
                            <input
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder={mode === 'register' ? '用户名' : '用户名或邮箱'}
                                className="w-full rounded-sm border border-vintage-border bg-vintage-bg px-2 py-2 text-xs outline-none focus:border-vintage-accent"
                            />
                            {mode === 'register' && (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="邮箱"
                                    className="w-full rounded-sm border border-vintage-border bg-vintage-bg px-2 py-2 text-xs outline-none focus:border-vintage-accent"
                                />
                            )}
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="密码"
                                className="w-full rounded-sm border border-vintage-border bg-vintage-bg px-2 py-2 text-xs outline-none focus:border-vintage-accent"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-sm bg-vintage-accent px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-vintage-bg disabled:opacity-50"
                            >
                                {loading ? '处理中...' : mode === 'register' ? '注册后继续评论' : '登录后继续评论'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div className="mt-4 space-y-3">
                {comments.length === 0 ? (
                    <p className="text-[10px] text-vintage-text/45">还没有评论，成为第一位读者观察员。</p>
                ) : (
                    comments.map((item) => (
                        <article key={item.id} className="rounded-sm border border-vintage-border bg-vintage-bg p-3">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-vintage-text/50">
                                <span className="font-bold text-vintage-accent">{item.username}</span>
                                <time>{formatArticleDateTime(item.created_at, 'zh')}</time>
                            </div>
                            {item.quote && (
                                <blockquote className="mb-2 border-l-2 border-vintage-accent bg-vintage-panel/40 px-2 py-1.5 text-[10px] leading-relaxed text-vintage-text/60">
                                    {item.quote}
                                </blockquote>
                            )}
                            <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-vintage-text/80">
                                {item.body}
                            </p>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
