'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, CheckCircle, ArrowRight, Sparkles, Globe, Clock } from 'lucide-react';

export function NewsletterPageContent() {
    const t = useTranslations('newsletter');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            return;
        }
        setStatus('success');
        setEmail('');
    };

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-16 bg-vintage-bg">
            <div className="max-w-xl mx-auto border border-dashed border-vintage-accent/60 bg-vintage-accent/[0.02] p-8 md:p-12 text-center rounded-none">
                {/* Icon */}
                <div className="inline-flex items-center justify-center mb-6 text-vintage-accent">
                    <Mail className="w-9 h-9" />
                </div>

                <h1 className="font-cinzel text-xl md:text-3xl font-black text-vintage-accent uppercase tracking-widest mb-4">
                    {t('title')}
                </h1>

                <p className="font-serif-vintage text-sm md:text-base text-vintage-text/85 mb-8 leading-relaxed">
                    {t('subtitle')}
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 border-t border-b border-vintage-border py-4 font-mono-raw text-[10px] text-vintage-text/70 uppercase tracking-widest">
                    <div className="flex flex-col items-center gap-1.5 justify-center">
                        <Sparkles className="w-4 h-4 text-vintage-accent" />
                        <span>Curated Stories</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 justify-center border-y sm:border-y-0 sm:border-x border-vintage-border/50 py-2 sm:py-0">
                        <Globe className="w-4 h-4 text-vintage-accent" />
                        <span>3 Languages</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 justify-center">
                        <Clock className="w-4 h-4 text-vintage-accent" />
                        <span>Weekly Digest</span>
                    </div>
                </div>

                {/* Form */}
                {status === 'success' ? (
                    <div className="flex items-center justify-center gap-3 p-4 bg-vintage-accent/5 border border-vintage-accent text-vintage-accent text-xs font-sans-intel rounded-none">
                        <CheckCircle className="w-5 h-5 text-vintage-accent shrink-0" />
                        <span className="font-bold">{t('success')}</span>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    >
                        <div className="flex-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setStatus('idle');
                                }}
                                placeholder={t('placeholder')}
                                className="w-full bg-vintage-bg border border-vintage-border focus:outline-none focus:border-vintage-accent text-xs px-4 py-3 rounded-none text-vintage-text placeholder-vintage-text/40 font-sans-intel"
                            />
                            {status === 'error' && (
                                <p className="mt-2 text-xs text-red-700 text-left font-sans-intel">
                                    {t('invalidEmail')}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-vintage-accent hover:bg-vintage-accent/90 text-vintage-bg font-mono-raw text-xs tracking-widest uppercase font-bold rounded-none transition-colors shrink-0"
                        >
                            {t('subscribe')}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
