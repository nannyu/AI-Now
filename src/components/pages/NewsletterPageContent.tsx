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
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="max-w-2xl mx-auto text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-6">
                    <Mail className="w-8 h-8 text-brand-600" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                    {t('title')}
                </h1>

                <p className="text-lg text-neutral-600 mb-10">
                    {t('subtitle')}
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="flex flex-col items-center gap-2 p-4">
                        <Sparkles className="w-5 h-5 text-brand-500" />
                        <span className="text-sm font-medium text-neutral-700">
                            Curated Stories
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4">
                        <Globe className="w-5 h-5 text-brand-500" />
                        <span className="text-sm font-medium text-neutral-700">
                            3 Languages
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4">
                        <Clock className="w-5 h-5 text-brand-500" />
                        <span className="text-sm font-medium text-neutral-700">
                            Weekly Digest
                        </span>
                    </div>
                </div>

                {/* Form */}
                {status === 'success' ? (
                    <div className="flex items-center justify-center gap-3 p-6 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="text-green-800 font-medium">{t('success')}</span>
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
                                className="w-full px-5 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                            />
                            {status === 'error' && (
                                <p className="mt-2 text-sm text-red-600 text-left">
                                    {t('invalidEmail')}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shrink-0"
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
