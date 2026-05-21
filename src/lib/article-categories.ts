import { categories, getLocalizedCategoryName, type Category } from './mock-data';

export const DEFAULT_CATEGORY_SLUG = 'ai-products';

type CategoryInput = {
    title?: string | null;
    summary?: string | null;
    body?: string | null;
    fallback?: string | null;
};

const legacyCategoryAliases: Record<string, string> = {
    'ai-applications': 'ai-products',
    'funding': 'funding-strategy',
    'funding-investment': 'funding-strategy',
    'tech-breakthroughs': 'technical-deep-dives',
    'technical-breakthroughs': 'technical-deep-dives',
    'founder-stories': 'founder-interviews',
    'industry-trends': 'ai-products',
    'global-expansion': 'funding-strategy',
};

function slugifyCategory(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
        .replace(/^-+|-+$/g, '');
}

export function categoryFromValue(value?: string | null): Category {
    const normalized = value?.trim() || '';
    const slug = slugifyCategory(normalized);
    const aliasedSlug = legacyCategoryAliases[slug];
    if (aliasedSlug) {
        return categories.find((category) => category.slug === aliasedSlug) || categories[0];
    }

    const matched = categories.find((category) => (
        category.slug === normalized ||
        category.id === normalized ||
        category.name.toLowerCase() === normalized.toLowerCase() ||
        category.slug === slug
    ));

    return matched || categories.find((category) => category.slug === DEFAULT_CATEGORY_SLUG) || categories[0];
}

export function normalizeCategorySlug(value?: string | null) {
    return categoryFromValue(value).slug;
}

export function inferArticleCategorySlug(input: CategoryInput) {
    const text = `${input.title || ''} ${input.summary || ''} ${input.body || ''}`.toLowerCase();
    const fallback = input.fallback ? categoryFromValue(input.fallback) : null;
    const fallbackIsKnown = Boolean(input.fallback && categories.some((category) => (
        category.slug === input.fallback ||
        category.id === input.fallback ||
        category.name.toLowerCase() === input.fallback?.toLowerCase()
    )));

    if (/狩猎夜|hunt night|product hunt|跳海|猎人|金勺|creator/.test(text)) {
        return 'hunt-night-community';
    }
    if (/ai实践派|源码|源代码|openclaw|技术拆解|万字拆解|多模态|芯片|模型架构|推理|算力/.test(text)) {
        return 'technical-deep-dives';
    }
    if (/硬件|耳机|宠物|机器人|具身|桌面龙虾|乐高|终端|设备|玩具|消费电子/.test(text)) {
        return 'ai-hardware';
    }
    if (/短剧|ip|迪士尼|盲盒|wakuart|刘慈欣|陈楸帆|小说|内容平台|视频工具|可爱/.test(text)) {
        return 'content-ip-media';
    }
    if (/融资|红杉|天使轮|轮融资|估值|商业策略|增长|赚钱|获客|投资/.test(text)) {
        return 'funding-strategy';
    }
    if (/对话|创始人|ceo|联合创始人|founder/.test(text)) {
        return 'founder-interviews';
    }

    return fallbackIsKnown && fallback ? fallback.slug : DEFAULT_CATEGORY_SLUG;
}

export function localizedCategories(locale: string) {
    return categories.map((category) => ({
        ...category,
        name: getLocalizedCategoryName(category, locale),
    }));
}
