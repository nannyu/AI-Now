'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export function NewsletterSection() {
    const t = useTranslations('newsletter');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setErrorMessage(t('invalidEmail'));
            return;
        }

        // Simulate success
        setStatus('success');
        setEmail('');
    };

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="relative px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-6">
                        <Mail className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {t('title')}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-base md:text-lg text-brand-100 mb-8">
                        {t('subtitle')}
                    </p>

                    {/* Form */}
                    {status === 'success' ? (
                        <div className="flex items-center justify-center gap-2 text-white bg-white/10 rounded-xl px-6 py-4">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-medium">{t('success')}</span>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                        >
                            <div className="flex-1 relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setStatus('idle');
                                    }}
                                    placeholder={t('placeholder')}
                                    className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
                                />
                                {status === 'error' && (
                                    <p className="absolute -bottom-6 left-0 text-xs text-red-200">
                                        {errorMessage}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors shrink-0"
                            >
                                {t('subscribe')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
