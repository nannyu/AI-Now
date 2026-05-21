import { NewsTicker } from '@/components/home/NewsTicker';
import { FeaturedArticle } from '@/components/home/FeaturedArticle';
import { CategorySection } from '@/components/home/CategorySection';
import { EditorsPicks } from '@/components/home/EditorsPicks';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { LatestStoriesSidebar } from '@/components/home/LatestStoriesSidebar';

export default function HomePage() {
    return (
        <>
            {/* News Ticker */}
            <NewsTicker />

            <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Featured Article */}
                <FeaturedArticle />

                {/* Main content with sidebar */}
                <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-16">
                    {/* Main content */}
                    <div className="space-y-16">
                        {/* Editor's Picks */}
                        <EditorsPicks />

                        {/* Category Sections */}
                        <CategorySection />

                        {/* Newsletter */}
                        <NewsletterSection />
                    </div>

                    {/* Sidebar */}
                    <LatestStoriesSidebar />
                </div>
            </div>
        </>
    );
}
