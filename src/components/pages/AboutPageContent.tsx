'use client';

import { useLocale } from 'next-intl';
import { Globe, Users, Zap } from 'lucide-react';

export function AboutPageContent() {
    const locale = useLocale();

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-vintage-bg">
            
            {/* Title / Hero Header */}
            <div className="max-w-3xl mb-12 border-b border-vintage-border/50 pb-6">
                <span className="text-[10px] font-mono-raw text-vintage-accent bg-vintage-accent/10 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-bold">
                    {locale === 'zh' ? '关于我们' : 'OUR MANIFESTO'}
                </span>
                <h1 className="text-3xl md:text-5xl font-cinzel tracking-tight font-black text-vintage-text mt-3 mb-6 leading-tight">
                    {locale === 'zh' ? '连接华夏AI创新力量' : "Bridging China's AI Innovation"}
                    <br />
                    <span className="font-serif-vintage tracking-normal italic text-vintage-accent font-normal">
                        {locale === 'zh' ? '与全球视野相拥' : 'With the World'}
                    </span>
                </h1>
                <p className="font-serif-vintage text-base md:text-lg text-vintage-text/90 leading-relaxed text-justify">
                    {locale === 'zh'
                        ? 'AI ROAR ｜ AI闹是一家多语言数字智库平台，专注于记录中国人工智能初创企业的崛起故事。我们深信，在技术全球化深度演进的当下，理解和连接中国活跃的AI生态是每一位技术决策者与行业观察者的必修课。'
                        : 'AI Roar is a multilingual digital publication dedicated to telling the stories of Chinese AI entrepreneurs. We believe these narratives deserve a global audience — and that understanding China\'s AI ecosystem is essential for anyone working in technology today.'}
                </p>
            </div>

            {/* Core Values Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                
                {/* Value 1 */}
                <div className="p-6 border border-vintage-border bg-vintage-panel/20 rounded-sm">
                    <div className="w-10 h-10 bg-vintage-accent text-vintage-bg rounded-sm flex items-center justify-center mb-4">
                        <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="font-cinzel text-xs font-black uppercase tracking-wider text-vintage-accent mb-2">
                        {locale === 'zh' ? '全球视角' : 'Global Perspective'}
                    </h3>
                    <p className="text-xs text-vintage-text/80 leading-relaxed font-sans-intel text-justify">
                        {locale === 'zh'
                            ? '我们提供中文、英文和德文三语同步的智库报告，旨在打破区域壁垒，推动跨语言的深度技术交流。'
                            : 'We publish in Chinese, English, and German to reach readers across continents. Our content bridges cultural and linguistic gaps in tech reporting.'}
                    </p>
                </div>

                {/* Value 2 */}
                <div className="p-6 border border-vintage-border bg-vintage-panel/20 rounded-sm">
                    <div className="w-10 h-10 bg-vintage-accent text-vintage-bg rounded-sm flex items-center justify-center mb-4">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-cinzel text-xs font-black uppercase tracking-wider text-vintage-accent mb-2">
                        {locale === 'zh' ? '聚焦创始人' : 'Founder-Focused'}
                    </h3>
                    <p className="text-xs text-vintage-text/80 leading-relaxed font-sans-intel text-justify">
                        {locale === 'zh'
                            ? '我们不仅传递融资金额，更深入探究技术大潮中个体的动机、愿景和创业历程，记录鲜活的商业标本。'
                            : 'We go beyond corporate statements to tell the human stories behind China\'s AI revolution — the founders, their motivations, and their journeys.'}
                    </p>
                </div>

                {/* Value 3 */}
                <div className="p-6 border border-vintage-border bg-vintage-panel/20 rounded-sm">
                    <div className="w-10 h-10 bg-vintage-accent text-vintage-bg rounded-sm flex items-center justify-center mb-4">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-cinzel text-xs font-black uppercase tracking-wider text-vintage-accent mb-2">
                        {locale === 'zh' ? '深度与敏锐' : 'Analytical Depth'}
                    </h3>
                    <p className="text-xs text-vintage-text/80 leading-relaxed font-sans-intel text-justify">
                        {locale === 'zh'
                            ? '我们不仅追求信息的速度，更依托专业的技术专家与分析人员，为您剥离行业迷雾，解构真实的成长哲学。'
                            : 'We focus on rigorous analysis, bringing you context and insights that break down the technical breakthroughs and strategic choices of Chinese tech unicorns.'}
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-3xl double-border-top border-vintage-accent/30 pt-8">
                <h2 className="font-cinzel text-sm tracking-widest font-black text-vintage-accent uppercase mb-4">
                    {locale === 'zh' ? '我们的宗旨' : 'Our Mission'}
                </h2>
                <div className="font-serif-vintage text-sm md:text-base text-vintage-text/85 leading-relaxed space-y-4 text-justify">
                    <p>
                        {locale === 'zh'
                            ? '中国的人工智能初创企业生态正在经历快速而剧烈的跃迁，然而由于地缘、语言隔阂和信息传播平台的碎片化，许多极具突破性的创新细节往往无法为外界所完全感知。'
                            : 'China\'s AI startup ecosystem is one of the most dynamic in the world, yet its inner workings often remain obscured from the global stage due to linguistic barriers, platform fragmentation, and cultural nuances.'}
                    </p>
                    <p>
                        {locale === 'zh'
                            ? 'AI ROAR ｜ AI闹的诞生正是为了改变这一现状。我们筛选和编译最具代表性的中文行业源头文献，融入地缘算力架构分析、估值追踪与多语言翻译模型，为全球技术观察者提供一扇高质量的洞察窗口。'
                            : 'AI Roar exists to bridge this gap. We curate high-fidelity reports, translate them with extreme semantic lock, and integrate them with real-time company spotlights. We aim to be the definitive window into eastern intelligence pipelines.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
