'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { LogIn, LogOut, Menu, Save, Search, Settings, Globe, UserRound, X } from 'lucide-react';
import clsx from 'clsx';

type ReaderUser = {
    username: string;
    email: string;
};

type AuthMode = 'login' | 'register' | 'profile';

export function Header() {
    const t = useTranslations('nav');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [readerUser, setReaderUser] = useState<ReaderUser | null>(null);
    const [adminAuthenticated, setAdminAuthenticated] = useState(false);
    const [accountUsername, setAccountUsername] = useState('');
    const [accountEmail, setAccountEmail] = useState('');
    const [accountPassword, setAccountPassword] = useState('');
    const [accountMessage, setAccountMessage] = useState('');
    const [accountLoading, setAccountLoading] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const localeString = locale === 'zh' ? 'zh-CN' : locale === 'de' ? 'de-DE' : 'en-US';
        setFormattedDate(new Date().toLocaleDateString(localeString, options));
    }, [locale]);

    const loadAccountState = async () => {
        const [readerRes, adminRes] = await Promise.all([
            fetch('/api/auth/session'),
            fetch('/api/admin/session'),
        ]);

        if (readerRes.ok) {
            const data = await readerRes.json();
            const user = data.user as ReaderUser;
            setReaderUser(user);
            setAccountUsername(user.username);
            setAccountEmail(user.email);
            setAuthMode('profile');
        } else {
            setReaderUser(null);
        }

        setAdminAuthenticated(adminRes.ok);
    };

    useEffect(() => {
        loadAccountState().catch(() => {
            setReaderUser(null);
            setAdminAuthenticated(false);
        });
    }, []);

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/latest', label: t('latest') },
        { href: '/categories', label: t('categories') },
        { href: '/about', label: t('about') },
        { href: '/newsletter', label: t('newsletter') },
    ];

    const locales: Array<{ code: Locale; label: string }> = [
        { code: 'en', label: 'EN' },
        { code: 'zh', label: 'ZH' },
        { code: 'de', label: 'DE' },
    ];

    const switchLocale = (newLocale: Locale) => {
        router.replace(pathname, { locale: newLocale });
        setLangMenuOpen(false);
    };

    const openAccountMenu = (mode: AuthMode) => {
        setAuthMode(readerUser ? 'profile' : mode);
        setAccountMessage('');
        setAccountPassword('');
        setAccountMenuOpen(true);
        setLangMenuOpen(false);
    };

    const submitAccountAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setAccountLoading(true);
        setAccountMessage('');

        const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
        const payload = authMode === 'register'
            ? { username: accountUsername, email: accountEmail, password: accountPassword }
            : { username: accountUsername, password: accountPassword };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setAccountMessage(data.error || '操作失败，请重试。');
                return;
            }
            await loadAccountState();
            setAccountPassword('');
            setAccountMessage(authMode === 'register' ? '注册成功。' : '登录成功。');
        } catch {
            setAccountMessage('网络异常，请稍后重试。');
        } finally {
            setAccountLoading(false);
        }
    };

    const saveAccountProfile = async (event: React.FormEvent) => {
        event.preventDefault();
        setAccountLoading(true);
        setAccountMessage('');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: accountUsername,
                    email: accountEmail,
                    password: accountPassword,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setAccountMessage(data.error || '保存失败，请重试。');
                return;
            }
            await loadAccountState();
            setAccountPassword('');
            setAccountMessage('账户设置已保存。');
        } catch {
            setAccountMessage('网络异常，请稍后重试。');
        } finally {
            setAccountLoading(false);
        }
    };

    const logoutReader = async () => {
        setAccountLoading(true);
        setAccountMessage('');

        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (!res.ok) {
                setAccountMessage('注销失败，请稍后重试。');
                return;
            }

            setReaderUser(null);
            setAccountUsername('');
            setAccountEmail('');
            setAccountPassword('');
            setAuthMode('login');
            setAccountMessage('已注销登录。');
        } catch {
            setAccountMessage('网络异常，注销失败。');
        } finally {
            setAccountLoading(false);
        }
    };

    const accountPanel = accountMenuOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setAccountMenuOpen(false)} />
            <div className="fixed right-4 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-sm border border-vintage-border bg-vintage-bg p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-vintage-border pb-2">
                    <div>
                        <h3 className="font-mono-raw text-[11px] font-black uppercase tracking-widest text-vintage-accent">
                            {readerUser ? '账户设置' : authMode === 'register' ? '注册账户' : '登录账户'}
                        </h3>
                        <p className="mt-1 text-[10px] text-vintage-text/55">
                            {readerUser ? '管理你的评论身份和登录信息。' : '登录后可以发表评论和划线标注。'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAccountMenuOpen(false)}
                        className="text-vintage-text/45 hover:text-vintage-accent"
                        aria-label="关闭"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {!readerUser && (
                    <div className="mb-3 flex rounded-sm border border-vintage-border bg-vintage-panel/30 p-0.5">
                        {(['login', 'register'] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                    setAuthMode(mode);
                                    setAccountMessage('');
                                    setAccountPassword('');
                                }}
                                className={clsx(
                                    'flex-1 px-3 py-1.5 text-[10px] font-bold',
                                    authMode === mode
                                        ? 'bg-vintage-accent text-vintage-bg'
                                        : 'text-vintage-text/60 hover:text-vintage-accent'
                                )}
                            >
                                {mode === 'login' ? '登录' : '注册'}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={readerUser ? saveAccountProfile : submitAccountAuth} className="space-y-3">
                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-vintage-text/50">
                            {readerUser || authMode === 'register' ? '用户名' : '用户名或邮箱'}
                        </label>
                        <input
                            value={accountUsername}
                            onChange={(event) => setAccountUsername(event.target.value)}
                            className="w-full rounded-sm border border-vintage-border bg-vintage-bg px-3 py-2 text-xs outline-none focus:border-vintage-accent"
                            required
                        />
                    </div>

                    {(readerUser || authMode === 'register') && (
                        <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-vintage-text/50">
                                邮箱
                            </label>
                            <input
                                type="email"
                                value={accountEmail}
                                onChange={(event) => setAccountEmail(event.target.value)}
                                className="w-full rounded-sm border border-vintage-border bg-vintage-bg px-3 py-2 text-xs outline-none focus:border-vintage-accent"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-vintage-text/50">
                            {readerUser ? '新密码（留空则不修改）' : '密码'}
                        </label>
                        <input
                            type="password"
                            value={accountPassword}
                            onChange={(event) => setAccountPassword(event.target.value)}
                            className="w-full rounded-sm border border-vintage-border bg-vintage-bg px-3 py-2 text-xs outline-none focus:border-vintage-accent"
                            required={!readerUser}
                            minLength={readerUser && !accountPassword ? undefined : 8}
                        />
                    </div>

                    {accountMessage && (
                        <p className="rounded-sm border border-vintage-border bg-vintage-panel/40 px-3 py-2 text-[10px] text-vintage-text/70">
                            {accountMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={accountLoading}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm bg-vintage-accent px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-vintage-bg disabled:opacity-50"
                    >
                        {readerUser ? <Save className="h-3 w-3" /> : <LogIn className="h-3 w-3" />}
                        {accountLoading ? '处理中...' : readerUser ? '保存设置' : authMode === 'register' ? '注册' : '登录'}
                    </button>
                </form>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-vintage-border pt-3 text-[10px] font-bold">
                    {adminAuthenticated && (
                        <a href="/admin" className="text-vintage-accent hover:underline">
                            进入后台
                        </a>
                    )}
                    {readerUser && (
                        <button
                            type="button"
                            onClick={logoutReader}
                            disabled={accountLoading}
                            className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-red-50 px-2 py-1 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <LogOut className="h-3 w-3" />
                            注销登录
                        </button>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <header className="w-full bg-vintage-bg text-vintage-text px-4 md:px-8 max-w-[1440px] mx-auto pt-2">
            {accountPanel}

            {/* Top Utility Bar (Desktop only) */}
            <div className="hidden md:flex items-center justify-between py-1 border-b border-vintage-border/50 text-[10px] font-mono-raw text-vintage-accent/80 tracking-wider uppercase font-bold">
                {/* Left: EST. & Date */}
                <div className="flex items-center gap-3">
                    <span>EST. 2025 • BEIJING</span>
                    {formattedDate && (
                        <>
                            <span className="text-vintage-border-dark">•</span>
                            <span className="text-vintage-text/60 font-medium">{formattedDate}</span>
                        </>
                    )}
                </div>

                {/* Right: Quick Tools (Search, Language, Admin) */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <Link
                        href="/search"
                        className="hover:text-vintage-accent transition-colors flex items-center gap-1.5 focus:outline-none"
                        aria-label={t('search')}
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span>{t('search')}</span>
                    </Link>

                    <span className="text-vintage-border-dark">|</span>

                    {readerUser ? (
                        <button
                            type="button"
                            onClick={() => openAccountMenu('profile')}
                            className="hover:text-vintage-accent transition-colors flex items-center gap-1.5 focus:outline-none text-vintage-text/70"
                            aria-label="账户设置"
                        >
                            <UserRound className="w-3.5 h-3.5" />
                            <span>{readerUser.username}</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => openAccountMenu('login')}
                                className="hover:text-vintage-accent transition-colors flex items-center gap-1.5 focus:outline-none text-vintage-text/70"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>登录</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => openAccountMenu('register')}
                                className="text-vintage-accent hover:text-vintage-text transition-colors"
                            >
                                注册
                            </button>
                        </div>
                    )}

                    <span className="text-vintage-border-dark">|</span>

                    <button
                        type="button"
                        onClick={() => openAccountMenu(readerUser ? 'profile' : 'login')}
                        className="hover:text-vintage-accent transition-colors flex items-center gap-1.5 focus:outline-none text-vintage-text/70"
                        aria-label="设置"
                        title="设置"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>设置</span>
                    </button>

                    <span className="text-vintage-border-dark">|</span>

                    {/* Language Switcher Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            className="flex items-center gap-1.5 hover:text-vintage-accent transition-all font-bold focus:outline-none"
                            aria-label="Switch language"
                        >
                            <Globe className="w-3.5 h-3.5 text-vintage-accent" />
                            <span>{locale.toUpperCase()}</span>
                        </button>

                        {langMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setLangMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1.5 w-24 bg-vintage-bg border border-vintage-border shadow-md rounded-sm py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {locales.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => switchLocale(l.code)}
                                            className={clsx(
                                                'w-full text-left px-3 py-1.5 font-mono-raw text-xs transition-colors focus:outline-none',
                                                locale === l.code
                                                    ? 'text-vintage-accent bg-vintage-panel font-extrabold'
                                                    : 'text-vintage-text/70 hover:bg-vintage-panel hover:text-vintage-accent'
                                            )}
                                        >
                                            {l.code.toUpperCase()} ({l.label})
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Brand Logo Banner */}
            <div className="hidden md:block py-4 text-center">
                <Link href="/" className="inline-flex items-center justify-center gap-3 group focus:outline-none select-none">
                    <img
                        src="/icon.png"
                        alt="AI闹 Logo"
                        className="w-10 h-10 object-contain transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
                    />
                    <h1 className="text-3xl md:text-4xl font-noto-serif-sc font-black tracking-tight bg-gradient-to-r from-[#252ef7] via-[#7d5bf2] to-[#fc82e7] bg-clip-text text-transparent transition-all">
                        AI ROAR ｜ AI闹
                    </h1>
                </Link>
                <div className="mt-1 text-xs font-bold text-vintage-accent/80 tracking-[0.25em] font-sans-intel uppercase text-center">
                    STORIES OF CHINESE AI ENTREPRENEURS, FOR THE WORLD
                </div>
            </div>

            {/* Mobile Header Bar */}
            <div className="flex md:hidden items-center justify-between py-2 border-b border-vintage-border/50">
                {/* Left: Hamburger menu toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1 hover:text-vintage-accent text-vintage-text focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>

                {/* Center: Brand Title */}
                <Link href="/" className="focus:outline-none group">
                    <h1 className="text-lg font-noto-serif-sc font-black tracking-tight flex items-center gap-1.5 select-none">
                        <img
                            src="/icon.png"
                            alt="AI闹 Logo"
                            className="w-5.5 h-5.5 object-contain"
                        />
                        <span className="bg-gradient-to-r from-[#252ef7] to-[#fc82e7] bg-clip-text text-transparent">
                            AI ROAR ｜ AI闹
                        </span>
                    </h1>
                </Link>

                {/* Right: Account + Language */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => openAccountMenu(readerUser ? 'profile' : 'login')}
                        className="flex items-center gap-1 bg-vintage-panel border border-vintage-border-dark/60 px-2 py-1 rounded text-[10px] font-mono-raw hover:bg-vintage-border/30 hover:border-vintage-accent transition-all font-bold focus:outline-none"
                        aria-label="设置"
                    >
                        <Settings className="w-3 h-3 text-vintage-accent" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            className="flex items-center gap-1 bg-vintage-panel border border-vintage-border-dark/60 px-2 py-1 rounded text-[10px] font-mono-raw hover:bg-vintage-border/30 hover:border-vintage-accent transition-all font-bold focus:outline-none"
                            aria-label="Switch language"
                        >
                            <Globe className="w-3 h-3 text-vintage-accent" />
                            <span>{locale.toUpperCase()}</span>
                        </button>

                        {langMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setLangMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1.5 w-24 bg-vintage-bg border border-vintage-border shadow-md rounded-sm py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {locales.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => switchLocale(l.code)}
                                            className={clsx(
                                                'w-full text-left px-3 py-1.5 font-mono-raw text-xs transition-colors focus:outline-none',
                                                locale === l.code
                                                    ? 'text-vintage-accent bg-vintage-panel font-extrabold'
                                                    : 'text-vintage-text/70 hover:bg-vintage-panel hover:text-vintage-accent'
                                            )}
                                        >
                                            {l.code.toUpperCase()} ({l.label})
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Subtitle Banner */}
            <div className="md:hidden double-border-bottom py-1 text-center">
                <div className="text-[8px] font-bold text-vintage-accent/80 tracking-wider font-sans-intel uppercase">
                    STORIES OF CHINESE AI ENTREPRENEURS, FOR THE WORLD
                </div>
            </div>

            {/* Classical Newspaper Double Border Nav Bar (Desktop only, centered) */}
            <div className="hidden md:flex justify-center border-t border-vintage-accent/30 double-border-bottom py-1.5">
                <nav className="flex items-center gap-10 font-sans-intel">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                'transition-colors hover:text-vintage-text border-b-2 py-0.5 tracking-[0.2em] text-xs font-bold uppercase',
                                pathname === link.href
                                    ? 'border-vintage-accent text-vintage-text'
                                    : 'border-transparent text-vintage-accent/70'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-vintage-border bg-vintage-panel py-3 px-4 mt-1 animate-in slide-in-from-top duration-300 font-sans-intel">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={clsx(
                                    'px-3 py-2 rounded text-sm font-bold tracking-wider transition-colors',
                                    pathname === link.href
                                        ? 'bg-vintage-accent text-vintage-bg'
                                        : 'text-vintage-text hover:bg-vintage-border/20'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <hr className="border-vintage-border/50 my-1" />
                        <div className="flex flex-wrap gap-4 px-3 pt-2 text-xs text-vintage-text/60">
                            <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="hover:text-vintage-accent flex items-center gap-1 font-bold">
                                <Search className="w-3.5 h-3.5" /> {t('search')}
                            </Link>
                            {!readerUser && (
                                <>
                                    <button type="button" onClick={() => openAccountMenu('login')} className="hover:text-vintage-accent flex items-center gap-1 font-bold">
                                        <LogIn className="w-3.5 h-3.5" /> 登录
                                    </button>
                                    <button type="button" onClick={() => openAccountMenu('register')} className="hover:text-vintage-accent flex items-center gap-1 font-bold">
                                        <UserRound className="w-3.5 h-3.5" /> 注册
                                    </button>
                                </>
                            )}
                            <button type="button" onClick={() => openAccountMenu(readerUser ? 'profile' : 'login')} className="hover:text-vintage-accent flex items-center gap-1 font-bold">
                                <Settings className="w-3.5 h-3.5" /> 设置
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
