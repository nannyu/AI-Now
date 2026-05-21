'use client';

import { useTranslations } from 'next-intl';
import { Globe, Users, Zap } from 'lucide-react';

export function AboutPageContent() {
    const t = useTranslations('nav');

    return (
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            {/* Hero */}
            <div className="max-w-3xl mb-16">
                <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
                    Bridging China's AI Innovation
                    <br />
                    <span className="text-brand-600">With the World</span>
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
                    AI Now is a multilingual publication dedicated to telling the stories
                    of Chinese AI entrepreneurs. We believe these stories deserve a global
                    audience — and that understanding China's AI ecosystem is essential for
                    anyone working in technology today.
                </p>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6 text-brand-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Global Perspective
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                        We publish in Chinese, English, and German to reach readers across
                        continents. Our content bridges cultural and linguistic gaps in tech
                        reporting.
                    </p>
                </div>

                <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-brand-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Founder-Focused
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                        We go beyond press releases to tell the human stories behind China's
                        AI revolution — the founders, their motivations, and their journeys.
                    </p>
                </div>

                <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-brand-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Timely & Relevant
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                        We curate and translate the most important stories from China's AI
                        ecosystem, delivering them to you within hours of publication.
                    </p>
                </div>
            </div>

            {/* Mission */}
            <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                    Our Mission
                </h2>
                <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
                    <p>
                        China's AI startup ecosystem is one of the most dynamic in the world,
                        yet its stories remain largely inaccessible to international audiences.
                        Language barriers, platform fragmentation, and cultural context gaps
                        mean that groundbreaking innovations often go unnoticed outside China.
                    </p>
                    <p>
                        AI Now exists to change that. We source content from leading WeChat
                        public accounts covering AI entrepreneurship, translate it with care
                        for nuance and context, and present it in a format that resonates with
                        global readers.
                    </p>
                    <p>
                        Whether you're an investor looking for the next opportunity, a
                        researcher tracking global AI progress, or simply curious about how
                        technology is evolving in China — AI Now is your window into this
                        world.
                    </p>
                </div>
            </div>
        </div>
    );
}
