// Mock data for development — will be replaced by database queries

export interface Article {
    id: string;
    slug: string;
    title: string;
    summary: string;
    author: string;
    publishDate: string;
    readingMinutes: number;
    coverImage: string;
    categories: Category[];
    isFeatured: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export const categories: Category[] = [
    { id: "1", name: "AI Applications", slug: "ai-applications" },
    { id: "2", name: "Funding & Investment", slug: "funding-investment" },
    { id: "3", name: "Technical Breakthroughs", slug: "technical-breakthroughs" },
    { id: "4", name: "Founder Stories", slug: "founder-stories" },
    { id: "5", name: "Industry Trends", slug: "industry-trends" },
    { id: "6", name: "Global Expansion", slug: "global-expansion" },
];

export const articles: Article[] = [
    {
        id: "1",
        slug: "deepseek-open-source-revolution",
        title: "DeepSeek Open Source Revolution: How a Chinese Lab is Reshaping the AI Landscape",
        summary: "DeepSeek has emerged as a formidable force in AI research, releasing models that rival the best from OpenAI and Google while keeping them open source.",
        author: "Zhang Wei",
        publishDate: "2026-05-20",
        readingMinutes: 8,
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop",
        categories: [categories[2], categories[4]],
        isFeatured: true,
    },
    {
        id: "2",
        slug: "minimax-raises-600m-series-c",
        title: "MiniMax Raises $600M in Series C, Valued at $6 Billion",
        summary: "The Shanghai-based AI startup has secured one of the largest funding rounds in Chinese AI history, backed by major global investors.",
        author: "Li Mei",
        publishDate: "2026-05-19",
        readingMinutes: 5,
        coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=675&fit=crop",
        categories: [categories[1]],
        isFeatured: false,
    },
    {
        id: "3",
        slug: "zhipu-ai-enterprise-strategy",
        title: "Zhipu AI Enterprise Strategy: Building China Answer to OpenAI for Business",
        summary: "With GLM-4 powering thousands of enterprise clients, Zhipu AI is carving out a unique position in the Chinese AI ecosystem.",
        author: "Wang Fang",
        publishDate: "2026-05-18",
        readingMinutes: 6,
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=675&fit=crop",
        categories: [categories[0], categories[3]],
        isFeatured: false,
    },
    {
        id: "4",
        slug: "moonshot-ai-kimi-global-launch",
        title: "Moonshot AI Takes Kimi Global: The Long-Context Assistant Expanding Beyond China",
        summary: "After dominating the Chinese market with its 2-million-token context window, Moonshot AI is now setting its sights on international users.",
        author: "Chen Hao",
        publishDate: "2026-05-17",
        readingMinutes: 7,
        coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=675&fit=crop",
        categories: [categories[0], categories[5]],
        isFeatured: false,
    },
    {
        id: "5",
        slug: "baichuan-intelligence-founder-interview",
        title: "From Sogou to Baichuan: Wang Xiaochuan on Building AI That Understands Chinese Culture",
        summary: "The veteran entrepreneur shares his vision for creating AI models that truly understand the nuances of Chinese language and culture.",
        author: "Liu Yang",
        publishDate: "2026-05-16",
        readingMinutes: 10,
        coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=675&fit=crop",
        categories: [categories[3]],
        isFeatured: false,
    },
    {
        id: "6",
        slug: "chinese-ai-chip-startups-rise",
        title: "The Rise of Chinese AI Chip Startups: Navigating Sanctions and Innovation",
        summary: "Despite export controls, a new generation of Chinese semiconductor startups is developing innovative AI accelerators.",
        author: "Zhao Min",
        publishDate: "2026-05-15",
        readingMinutes: 9,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&fit=crop",
        categories: [categories[2], categories[4]],
        isFeatured: false,
    },
    {
        id: "7",
        slug: "ai-robotics-startups-shenzhen",
        title: "Shenzhen AI Robotics Boom: 5 Startups Redefining Automation",
        summary: "From warehouse logistics to surgical assistance, Shenzhen-based startups are combining AI with robotics in groundbreaking ways.",
        author: "Sun Jie",
        publishDate: "2026-05-14",
        readingMinutes: 6,
        coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=675&fit=crop",
        categories: [categories[0], categories[2]],
        isFeatured: false,
    },
    {
        id: "8",
        slug: "stepfun-multimodal-ai-breakthrough",
        title: "StepFun Multimodal Breakthrough: Video Understanding at Scale",
        summary: "The Beijing startup has achieved state-of-the-art results in video understanding, processing hours of footage in seconds.",
        author: "Huang Lei",
        publishDate: "2026-05-13",
        readingMinutes: 5,
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=675&fit=crop",
        categories: [categories[2]],
        isFeatured: false,
    },
];

export function getFeaturedArticle(): Article {
    return articles.find((a) => a.isFeatured) || articles[0];
}

export function getLatestArticles(count: number = 10): Article[] {
    return articles.slice(0, count);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
    return articles.filter((a) =>
        a.categories.some((c) => c.slug === categorySlug)
    );
}

export function getArticleBySlug(slug: string): Article | undefined {
    return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: Article, count: number = 4): Article[] {
    const categoryIds = article.categories.map((c) => c.id);
    return articles
        .filter(
            (a) =>
                a.id !== article.id &&
                a.categories.some((c) => categoryIds.includes(c.id))
        )
        .slice(0, count);
}
