import { getFeaturedDbArticle, getLatestDbArticles } from '@/lib/db-articles';
import { formatArticleDate } from '@/lib/format-date';
import { Link } from '@/i18n/routing';
import { Clock, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'home' });
    const newsT = await getTranslations({ locale, namespace: 'newsletter' });

    const featured = getFeaturedDbArticle();
    const latestArticles = getLatestDbArticles(8);
    const latest = latestArticles
        .filter((article) => !featured || article.id !== featured.id)
        .slice(0, 5);
    const hasPublishedArticles = Boolean(featured) || latest.length > 0;

    const tickerItems: Array<{ title: string; href?: string }> = latestArticles.length > 0
        ? latestArticles.map((article) => ({
            title: article.title,
            href: `/article/${article.slug}`,
        }))
        : [
            { title: t('ticker.b1') },
            { title: t('ticker.b2') },
            { title: t('ticker.b3') },
            { title: t('ticker.b4') },
        ];

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 md:py-4">
            
            {/* Header News Ticker (Vintage Editorial Style) */}
            <div className="w-full bg-vintage-panel border-t border-b border-vintage-border py-1.5 px-3 mb-4 overflow-hidden select-none">
                <div className="flex items-center gap-4 text-[10px] font-mono-raw text-vintage-accent uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1 shrink-0 bg-vintage-accent text-vintage-bg px-1.5 py-0.5 rounded-sm relative z-10">
                        BULLETIN
                    </span>
                    <div className="flex-1 overflow-hidden relative z-0">
                        <div className="flex gap-12 animate-[ticker-scroll_35s_linear_infinite] whitespace-nowrap">
                            {[...tickerItems, ...tickerItems].map((item, index) => (
                                <span key={`${item.title}-${index}`}>
                                    •{' '}
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className="hover:text-vintage-text hover:underline underline-offset-2 transition-colors"
                                        >
                                            {item.title}
                                        </Link>
                                    ) : (
                                        item.title
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Newspaper Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SECTION (lg:col-span-8): Primary Stories Column */}
                <main className="lg:col-span-8 space-y-8">

                    {!hasPublishedArticles && (
                        <section className="border border-dashed border-vintage-border rounded-sm p-10 text-center">
                            <p className="font-serif-vintage text-lg text-vintage-text/70">
                                {t('noPublishedArticles')}
                            </p>
                        </section>
                    )}

                    {featured && (
                    <section className="border-b border-vintage-border/50 pb-8">
                        {/* Category and Date */}
                        <div className="flex items-center justify-between text-[11px] font-mono-raw text-vintage-text/60 uppercase tracking-widest pb-1 border-b border-vintage-border/50">
                            <span className="font-bold text-vintage-accent">
                                {featured.categoryLabel}
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                                <Clock className="w-3.5 h-3.5" />
                                {formatArticleDate(featured.publishDate, locale)}
                            </span>
                        </div>

                        {/* Title */}
                        <Link href={`/article/${featured.slug}`} className="group focus:outline-none">
                            <h2 className="font-serif-vintage text-2xl md:text-4xl lg:text-5xl leading-tight font-black text-vintage-text group-hover:text-vintage-accent transition-colors duration-300 mt-3 mb-3 text-justify">
                                {featured.title}
                            </h2>
                        </Link>

                        {/* Subtitle / Standfirst */}
                        <div className="bg-vintage-panel/50 border-l-[3px] border-vintage-accent pl-4 py-2 my-4 text-xs md:text-sm text-vintage-text/85 font-sans-intel leading-relaxed">
                            {featured.subtitle}
                        </div>

                        {/* Cover Image */}
                        <Link href={`/article/${featured.slug}`} className="block overflow-hidden border border-vintage-border/40 rounded-sm my-4 aspect-[21/9] focus:outline-none relative group">
                            <img
                                src={featured.coverImage}
                                alt={featured.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                            />
                        </Link>

                        {/* Intro Paragraph (with Styled Dropcap) */}
                        <div className="font-serif-vintage text-sm md:text-base leading-relaxed text-vintage-text space-y-4 text-justify mt-4">
                            <p className="drop-cap">
                                {featured.summary}
                            </p>
                        </div>

                        {/* Read Link & Meta info */}
                        <div className="flex items-center justify-between border-t border-b border-vintage-border py-2.5 mt-6 text-xs text-vintage-text/60 font-sans-intel">
                            <div>
                                <span className="font-semibold">{locale === 'zh' ? '特约编辑' : 'STAFF WRITER'} • {featured.author}</span>
                            </div>
                            <Link 
                                href={`/article/${featured.slug}`} 
                                className="flex items-center gap-1.5 font-bold text-vintage-accent hover:underline text-xs tracking-wider font-mono-raw uppercase"
                            >
                                {t('readMore')}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </section>
                    )}

                    {latest.length > 0 && (
                    <section>
                        <h3 className="font-cinzel text-base tracking-widest font-black text-vintage-accent uppercase mb-5 pb-1 border-b-2 border-vintage-accent/20">
                            {locale === 'zh' ? "最新深度报道" : "LATEST DISPATCHES"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {latest.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/article/${article.slug}`}
                                    className="group flex flex-col p-4 border border-vintage-border bg-vintage-bg hover:bg-vintage-panel/20 transition-all duration-300 rounded-sm focus:outline-none justify-between h-full"
                                >
                                    <div>
                                        {/* Cover */}
                                        <div className="w-full aspect-[16/10] overflow-hidden rounded-sm border border-vintage-border/30 mb-3.5">
                                            <img
                                                src={article.coverImage}
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                            />
                                        </div>

                                        {/* Category */}
                                        <span className="text-[9px] font-mono-raw font-extrabold uppercase tracking-wider text-vintage-accent/70 block mb-1">
                                            {article.categoryLabel}
                                        </span>

                                        {/* Title */}
                                        <h4 className="font-serif-vintage text-base font-bold text-vintage-text group-hover:text-vintage-accent transition-colors duration-200 line-clamp-2 leading-snug mb-2">
                                            {article.title}
                                        </h4>

                                        {/* Summary excerpt */}
                                        <p className="text-[11px] text-vintage-text/75 line-clamp-3 leading-relaxed mb-4 font-sans-intel text-justify">
                                            {article.summary}
                                        </p>
                                    </div>

                                    {/* Author & Read Time */}
                                    <div className="flex items-center justify-between border-t border-vintage-border/40 pt-2 text-[10px] text-vintage-text/60 font-mono-raw">
                                        <span>{article.author}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {t('minRead', { minutes: article.readingMinutes })}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                    )}

                </main>

                <aside className="lg:col-span-4 lg:border-l lg:border-vintage-border lg:pl-6 space-y-6">

                    {/* Editorial Newsletter Subscription Box */}
                    <div className="border border-dashed border-vintage-accent/40 bg-vintage-accent/[0.02] p-4 text-center rounded-sm">
                        <h4 className="font-cinzel text-xs font-black text-vintage-accent tracking-widest uppercase mb-1">
                            {newsT('title')}
                        </h4>
                        <p className="text-[11px] leading-relaxed text-vintage-text/75 mb-4 font-sans-intel">
                            {newsT('subtitle')}
                        </p>
                        
                        <div className="space-y-2">
                            <input
                                type="email"
                                placeholder={newsT('placeholder')}
                                className="w-full bg-vintage-bg border border-vintage-border focus:outline-none focus:border-vintage-accent text-xs px-2.5 py-1.5 rounded-sm text-vintage-text placeholder-vintage-text/45 font-sans-intel"
                            />
                            <button className="w-full bg-vintage-accent text-vintage-bg hover:bg-vintage-accent/90 transition-colors font-mono-raw text-[10px] tracking-widest uppercase font-bold py-1.5 rounded-sm">
                                {newsT('subscribe')}
                            </button>
                        </div>
                    </div>

                    {/* Brief About Portal Pitch */}
                    <div className="bg-vintage-bg border border-vintage-border p-3 text-xs space-y-2">
                        <h4 className="font-mono-raw font-bold text-[10px] uppercase text-vintage-accent tracking-wider pb-1 border-b border-vintage-border">
                            {locale === 'zh' ? "AI NOW 宣言" : "AI NOW STATEMENT"}
                        </h4>
                        <p className="text-[10px] leading-relaxed text-vintage-text/75 font-sans-intel text-justify italic">
                            {locale === 'zh'
                                ? "“以客观、深度的全球化视角，记录和解构中国AI创业者的技术跃迁与商业变迁，让世界看见东方的智能力量。”"
                                : "“To document and dissect the technical leaps and commercial evolution of Chinese AI founders through an objective, deep global lens, bridging the intelligence pipelines.”"}
                        </p>
                    </div>

                </aside>

            </div>

        </div>
    );
}
