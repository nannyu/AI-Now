'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Article } from '@/lib/mock-data';
import { ReadingProgress } from './ReadingProgress';
import { ShareButtons } from './ShareButtons';
import { Clock, Calendar, ChevronRight } from 'lucide-react';

interface Props {
    article: Article;
}

export function ArticleContent({ article }: Props) {
    const t = useTranslations('article');
    const home = useTranslations('home');

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <ReadingProgress />

            <article className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-neutral-500 py-6">
                    <Link href="/" className="hover:text-brand-600 transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link
                        href={`/category/${article.categories[0]?.slug}`}
                        className="hover:text-brand-600 transition-colors"
                    >
                        {article.categories[0]?.name}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-neutral-400 truncate max-w-[200px]">
                        {article.title}
                    </span>
                </nav>

                {/* Header */}
                <header className="max-w-article mx-auto mb-8">
                    {/* Categories */}
                    <div className="flex items-center gap-2 mb-4">
                        {article.categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 rounded-full hover:bg-brand-100 transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-6 text-balance">
                        {article.title}
                    </h1>

                    {/* Summary */}
                    <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-6">
                        {article.summary}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 pb-6 border-b border-neutral-200">
                        <span className="font-medium text-neutral-900">
                            {article.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(article.publishDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {home('minRead', { minutes: article.readingMinutes })}
                        </span>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="max-w-4xl mx-auto mb-10">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden">
                        <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Article Body */}
                <div className="max-w-article mx-auto">
                    <div className="article-body">
                        <p>
                            In the rapidly evolving landscape of Chinese artificial intelligence,
                            a new generation of entrepreneurs is emerging with bold visions and
                            innovative approaches. These founders are not merely following Silicon
                            Valley's playbook — they're writing their own.
                        </p>

                        <h2>The New Wave of Innovation</h2>

                        <p>
                            China's AI startup ecosystem has undergone a dramatic transformation
                            in recent years. Where once the focus was on applying existing
                            technologies to massive domestic markets, today's founders are pushing
                            the boundaries of fundamental research while simultaneously building
                            products that serve millions.
                        </p>

                        <p>
                            The convergence of several factors — abundant talent from top
                            universities, significant government support, and a massive domestic
                            market hungry for AI-powered solutions — has created fertile ground
                            for innovation that rivals anything coming out of the West.
                        </p>

                        <blockquote>
                            "We're not trying to copy what's been done elsewhere. We're building
                            something that reflects the unique needs and opportunities of our
                            market." — Founder interview
                        </blockquote>

                        <h2>Technical Differentiation</h2>

                        <p>
                            What sets many of these startups apart is their willingness to invest
                            heavily in fundamental research. Rather than simply fine-tuning
                            existing models, they're developing novel architectures and training
                            methodologies that address specific challenges in Chinese language
                            processing, multimodal understanding, and efficient inference.
                        </p>

                        <p>
                            This approach has yielded impressive results. Several Chinese AI
                            startups have published papers at top conferences that introduce
                            genuinely new ideas to the field, earning recognition from the global
                            research community.
                        </p>

                        <h3>Key Technical Advances</h3>

                        <ul>
                            <li>Novel attention mechanisms optimized for Chinese text</li>
                            <li>Efficient training techniques that reduce compute requirements</li>
                            <li>Multimodal architectures that handle Chinese-specific visual content</li>
                            <li>Deployment optimizations for mobile and edge devices</li>
                        </ul>

                        <h2>Market Strategy</h2>

                        <p>
                            Beyond technical innovation, these startups are also pioneering new
                            business models. Many are taking a dual approach: offering open-source
                            models to build community and developer mindshare, while
                            simultaneously developing enterprise solutions that generate revenue.
                        </p>

                        <p>
                            This strategy has proven particularly effective in China's market,
                            where enterprises are eager to adopt AI but often require customization
                            and support that only dedicated teams can provide.
                        </p>
                    </div>

                    {/* Share buttons */}
                    <div className="mt-10 pt-6 border-t border-neutral-200">
                        <ShareButtons title={article.title} />
                    </div>
                </div>
            </article>
        </>
    );
}
