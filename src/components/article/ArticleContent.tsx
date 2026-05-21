'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article } from '@/lib/mock-data';
import { ReadingProgress } from './ReadingProgress';
import { ShareButtons } from './ShareButtons';
import { Clock, Calendar, ChevronRight, ArrowUpRight } from 'lucide-react';

interface Props {
    article: Article;
}

export function ArticleContent({ article }: Props) {
    const home = useTranslations('home');
    const locale = useLocale();
    const bodyIsHtml = /<\/?[a-z][\s\S]*>/i.test(article.body);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Split body text by newlines into paragraphs
    const paragraphs = article.body ? article.body.split(/\n+/) : [];

    return (
        <>
            <ReadingProgress />

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-1.5 text-[10px] font-mono-raw text-vintage-text/50 py-4 uppercase tracking-widest border-b border-vintage-border/30">
                    <Link href="/" className="hover:text-vintage-accent transition-colors font-bold">
                        {locale === 'zh' ? '主页' : 'HOME'}
                    </Link>
                    <ChevronRight className="w-3 h-3 text-vintage-text/30" />
                    <Link
                        href={`/categories`}
                        className="hover:text-vintage-accent transition-colors font-bold"
                    >
                        {locale === 'zh' ? '分类' : 'CATEGORIES'}
                    </Link>
                    <ChevronRight className="w-3 h-3 text-vintage-text/30" />
                    <span className="text-vintage-text/40 truncate max-w-[180px] font-bold">
                        {article.title}
                    </span>
                </nav>

                {/* Main Article Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 md:py-8 items-start">
                    
                    {/* LEFT COLUMN (lg:col-span-8): Main Article Content */}
                    <article className="lg:col-span-8 space-y-6">
                        
                        {/* Meta Category and Date */}
                        <div className="flex items-center justify-between text-[11px] font-mono-raw text-vintage-text/60 uppercase tracking-widest pb-1 border-b border-vintage-border/50">
                            <span className="font-bold text-vintage-accent">
                                {article.categoryLabel || article.categories[0]?.name}
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(article.publishDate)}
                            </span>
                        </div>

                        {/* Article Headline */}
                        <h1 className="font-serif-vintage text-2xl md:text-4xl lg:text-5xl leading-tight font-black text-vintage-text">
                            {article.title}
                        </h1>

                        {/* Standfirst / Subhead */}
                        {article.subtitle && (
                            <div className="bg-vintage-panel/50 border-l-[3px] border-vintage-accent pl-4 py-2 my-4 text-xs md:text-sm text-vintage-text/85 font-sans-intel leading-relaxed">
                                {article.subtitle}
                            </div>
                        )}

                        {/* Staff / Writer Metadata */}
                        <div className="flex items-center justify-between border-t border-b border-vintage-border/50 py-2.5 my-4 text-xs text-vintage-text/60 font-sans-intel">
                            <div>
                                <span className="font-semibold">{locale === 'zh' ? '特约编辑' : 'STAFF WRITER'} • {article.author}</span>
                            </div>
                            <span className="flex items-center gap-1 font-semibold font-mono-raw text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-vintage-accent" />
                                {home('minRead', { minutes: article.readingMinutes })}
                            </span>
                        </div>

                        {/* Hero Image */}
                        {article.coverImage && (
                            <div className="overflow-hidden border border-vintage-border/40 rounded-sm my-4 aspect-[16/9]">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Localized Body Paragraphs (with dropcap) */}
                        {bodyIsHtml ? (
                            <div
                                className="article-body font-serif-vintage text-sm md:text-base leading-relaxed text-vintage-text text-justify pt-2"
                                dangerouslySetInnerHTML={{ __html: article.body }}
                            />
                        ) : (
                            <div className="font-serif-vintage text-sm md:text-base leading-relaxed text-vintage-text space-y-4 text-justify pt-2">
                                {paragraphs.map((p, idx) => (
                                    <p
                                        key={idx}
                                        className={idx === 0 ? "drop-cap text-justify" : "text-justify"}
                                    >
                                        {p.trim()}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* Share buttons */}
                        <div className="pt-6 border-t border-vintage-border mt-8">
                            <ShareButtons title={article.title} />
                        </div>

                    </article>

                    {/* RIGHT COLUMN (lg:col-span-4): Startup Spotlight Sidebar */}
                    <aside className="lg:col-span-4 lg:border-l lg:border-vintage-border lg:pl-6 space-y-6 pt-2">
                        
                        {/* Conditionally display Startup Spotlight if present */}
                        {article.startup ? (
                            <div className="bg-vintage-panel/50 border border-vintage-border p-4 rounded-sm">
                                <div className="flex items-center gap-1.5 pb-2 border-b border-vintage-border text-vintage-accent">
                                    <h3 className="font-cinzel text-[11px] font-black tracking-wider uppercase">
                                        {locale === 'zh' ? "被投初创公司情报" : "COMPANY IN SPOTLIGHT"}
                                    </h3>
                                </div>
                                
                                <div className="mt-4 space-y-3 font-sans-intel">
                                    <div>
                                        <label className="text-[9px] font-mono-raw font-bold text-vintage-text/50 block uppercase">Spotlight Entity</label>
                                        <span className="text-xs font-bold text-vintage-accent flex items-center gap-1 mt-0.5">
                                            {article.startup.entity}
                                            <ArrowUpRight className="w-3 h-3 text-vintage-accent" />
                                        </span>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono-raw font-bold text-vintage-text/50 block uppercase">Primary Sector focus</label>
                                        <span className="text-xs text-vintage-text/90 block mt-0.5 leading-snug">
                                            {article.startup.sector}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono-raw font-bold text-vintage-text/50 block uppercase">Estimated Valuation</label>
                                        <span className="text-xs text-vintage-accent font-bold block mt-0.5">
                                            {article.startup.valuation}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono-raw font-bold text-vintage-text/50 block uppercase">Institution Funders</label>
                                        <p className="text-xs text-vintage-text/85 mt-0.5 leading-relaxed">
                                            {article.startup.investors}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono-raw font-bold text-vintage-text/50 block uppercase">Core Tech Stack</label>
                                        <span className="text-[10px] font-mono-raw bg-vintage-accent/15 text-vintage-accent px-1.5 py-0.5 inline-block rounded-sm border border-vintage-accent/20 mt-1">
                                            {article.startup.techStack}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Fallback spotlit list if article doesn't specify one
                            <div className="bg-vintage-panel/50 border border-vintage-border p-4 rounded-sm">
                                <div className="flex items-center gap-1.5 pb-2 border-b border-vintage-border text-vintage-accent">
                                    <h3 className="font-cinzel text-[11px] font-black tracking-wider uppercase">
                                        {locale === 'zh' ? "华夏AI独角兽名册" : "STARTUP INTELLIGENCE"}
                                    </h3>
                                </div>
                                <p className="text-[10px] leading-relaxed text-vintage-text/75 mt-3 font-sans-intel">
                                    {locale === 'zh'
                                        ? "点击左上角 AI NOW 标志返回首页查看详细的独角兽情报面板。"
                                        : "Click the brand logo at the top left to return home and check full startup ledgers."}
                                </p>
                            </div>
                        )}

                        {/* Newspaper Statement Block */}
                        <div className="bg-vintage-bg border border-vintage-border p-3 text-xs">
                            <h4 className="font-mono-raw font-bold text-[10px] uppercase text-vintage-accent tracking-wider pb-1 border-b border-vintage-border">
                                {locale === 'zh' ? "AI NOW 声明" : "AI NOW STATEMENT"}
                            </h4>
                            <p className="text-[10px] leading-relaxed text-vintage-text/75 font-sans-intel text-justify italic mt-2">
                                {locale === 'zh'
                                    ? "“以客观、深度的全球化视角，记录和解构中国AI创业者的技术跃迁与商业变迁，让世界看见东方的智能力量。”"
                                    : "“To document and dissect the technical leaps and commercial evolution of Chinese AI founders through an objective, deep global lens, bridging the intelligence pipelines.”"}
                            </p>
                        </div>

                    </aside>

                </div>

            </div>
        </>
    );
}
