# Implementation Plan: Chinese AI Startup News

## Overview

This plan implements a multilingual news platform for Chinese AI startup stories. The system migrates from Vite+React to Next.js 15 (App Router), adds a PostgreSQL data layer with Prisma, a content crawler using wechat-rss-lite, AI translation via OpenAI/DeepL queued through BullMQ, and a newsletter service via Resend. All code is TypeScript.

## Tasks

- [ ] 1. Project setup and core infrastructure
  - [ ] 1.1 Initialize Next.js 15 project with App Router and TypeScript
    - Create Next.js 15 project with App Router structure
    - Configure `next.config.ts` with i18n settings for `next-intl`
    - Install and configure `next-intl` with locale folder routing (`/[locale]/...`)
    - Set up supported locales: `zh`, `en`, `de` with `en` as default
    - Configure path aliases and TypeScript strict mode
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 1.2 Set up Prisma ORM with PostgreSQL schema
    - Install Prisma and initialize with PostgreSQL provider
    - Define all data models: `WeChatSource`, `Article`, `ArticleTranslation`, `Category`, `ArticleCategory`, `Subscriber`, `TermList`
    - Define enums: `ArticleStatus` (PENDING, APPROVED, REJECTED, PUBLISHED)
    - Add indexes on `[status, crawledAt]`, `[publishedAt]`, `[isFeatured]`
    - Add unique constraint on `Article.sourceUrl` and `Subscriber.confirmationToken`
    - Run initial migration
    - _Requirements: 1.2, 1.3, 1.6, 10.1_

  - [ ] 1.3 Set up Redis and BullMQ for job queuing
    - Install BullMQ and ioredis
    - Create queue configuration for translation jobs
    - Create queue configuration for newsletter jobs
    - Set up connection pooling and error handling
    - _Requirements: 2.1, 2.2, 8.4_

  - [ ] 1.4 Set up testing framework with fast-check
    - Install Vitest, fast-check, and testing utilities
    - Configure `vitest.config.ts` with path aliases
    - Create `__tests__/properties/` directory structure
    - Create test helpers and shared arbitraries for common data types
    - _Requirements: All (testing infrastructure)_

- [ ] 2. Content Crawler service
  - [ ] 2.1 Implement crawler core with wechat-rss-lite integration
    - Install `wechat-rss-lite` and `node-cron`
    - Create `CrawlerConfig` interface and configuration loader
    - Implement `WeChatSource` management (add/remove/toggle, support 50+ sources)
    - Implement article fetching: extract title, body, author, publish date, cover image
    - Handle missing optional fields (author, coverImage) gracefully
    - Store ingested articles with `PENDING` status
    - _Requirements: 1.1, 1.2, 1.6, 1.7, 1.8_

  - [ ] 2.2 Implement deduplication and retry logic
    - Implement deduplication by checking `sourceUrl` uniqueness before insert
    - Implement retry logic: up to 3 attempts with configurable delay (default 5 min)
    - Mark source as temporarily unavailable after exhausting retries
    - Send notification to editor on source failure
    - Log all errors with structured logging
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 2.3 Implement cron scheduling for crawler
    - Configure node-cron with configurable interval (15 min to 24 hours, default 60 min)
    - Implement graceful shutdown and job overlap prevention
    - Add health check endpoint for crawler service
    - _Requirements: 1.1_

  - [ ]* 2.4 Write property tests for crawler deduplication and status
    - **Property 1: Duplicate Article Detection** — Verify ingestion only creates entries for unique URLs and count increases by exactly the number of new unique URLs
    - **Property 2: New Articles Default to Pending Status** — Verify all ingested articles have PENDING status regardless of content
    - **Validates: Requirements 1.3, 1.6**

- [ ] 3. Translation service
  - [ ] 3.1 Implement translation queue processor with BullMQ
    - Create BullMQ worker for translation jobs
    - Implement job creation on article approval (both `en` and `de` targets)
    - Handle job status transitions: queued → processing → completed/failed
    - Implement 60-second timeout per translation request
    - Implement re-translation on article update and re-approval
    - _Requirements: 2.1, 2.2, 2.5, 2.7_

  - [ ] 3.2 Implement OpenAI GPT-4o translation with DeepL fallback
    - Integrate OpenAI API for translation with system prompt for quality
    - Implement term list preservation (pass term list in prompt context)
    - Implement DeepL API as fallback when OpenAI fails
    - Handle provider switching logic and error reporting
    - Notify editor within 5 minutes on translation failure
    - _Requirements: 2.4, 2.6_

  - [ ] 3.3 Implement HTML structure preservation in translation
    - Parse article HTML to extract structural elements before translation
    - Translate text content while preserving heading hierarchy, paragraphs, lists, links, images
    - Reassemble translated content maintaining original structure
    - Validate output structure matches input structure
    - _Requirements: 2.3_

  - [ ]* 3.4 Write property tests for translation service
    - **Property 3: HTML Structure Preservation** — Verify output has same number/nesting of structural elements as input
    - **Property 4: Term Preservation** — Verify all term list entries appear unchanged in translated output
    - **Validates: Requirements 2.3, 2.6**

- [ ] 4. Checkpoint - Core backend services
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Frontend layout and i18n infrastructure
  - [ ] 5.1 Create locale-aware layout with navigation
    - Implement `app/[locale]/layout.tsx` with `next-intl` provider
    - Create top navigation bar: Home, Latest, Categories, About, Newsletter
    - Implement language switcher component (zh, en, de) visible on every page
    - Implement hamburger menu for mobile (<768px)
    - Implement breadcrumb navigation component
    - Persist language selection in cookie (30-day expiry)
    - _Requirements: 3.1, 3.2, 3.7, 6.2, 7.1, 7.7_

  - [ ] 5.2 Implement browser language detection and locale routing
    - Implement middleware for Accept-Language header detection
    - Default to `en` when no supported locale matches
    - Implement locale-specific URL path generation (`/[locale]/...`)
    - Handle invalid locale redirects (302 to English version)
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ] 5.3 Implement responsive design system and typography
    - Set up CSS/Tailwind with breakpoints: 320px, 768px, 1024px, 1920px
    - Implement single-column (<768px), two-column (768-1024px), multi-column (>1024px) layouts
    - Configure sans-serif font for headings, serif for body (16px min, line-height 1.5+)
    - Implement 4-level heading scale with 4px minimum difference between levels
    - Set up 8px spacing grid system
    - Implement font fallback strategy (3-second timeout to system fonts)
    - Ensure WCAG 2.1 AA contrast (4.5:1 normal text, 3:1 large text)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7, 11.1, 11.2, 11.4, 11.5, 11.6_

  - [ ]* 5.4 Write property tests for locale and URL utilities
    - **Property 5: Locale URL Generation** — Verify URL matches `/{locale}/{path}` pattern and locale switch only changes locale segment
    - **Property 6: Browser Language Detection** — Verify supported locale detection and default to 'en' for unsupported
    - **Property 7: Text Truncation** — Verify output ≤ 200 chars and short inputs unchanged
    - **Property 13: Breadcrumb Path Generation** — Verify list starts with "Home", ends with current page, intermediate elements are valid paths
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 4.2, 7.7**

- [ ] 6. Homepage implementation
  - [ ] 6.1 Implement homepage ticker and featured article section
    - Create horizontally scrolling ticker showing 10 most recent article titles with publish time and reading duration
    - Implement swipe gesture support for touch devices on ticker
    - Create featured article section: 1 primary article with 16:9 cover image, title, 200-char summary
    - Implement text truncation utility (max 200 characters)
    - _Requirements: 4.1, 4.2, 6.6_

  - [ ] 6.2 Implement category sections and Editor's Picks
    - Create category section component showing up to 4 articles per category (title, cover image, publish date)
    - Hide category sections with zero published articles
    - Create Editor's Picks carousel (3-8 curated articles with cover image, title, category label)
    - Implement swipe gesture support for carousel on touch devices
    - _Requirements: 4.3, 4.5, 4.7, 6.6_

  - [ ] 6.3 Implement newsletter subscription section on homepage
    - Create email input field with subscribe button
    - Implement client-side email format validation with inline error messages
    - Connect to newsletter subscription API
    - _Requirements: 4.6, 8.2_

  - [ ]* 6.4 Write property tests for homepage logic
    - **Property 8: Homepage Category Display Rules** — Verify only categories with articles shown, max 4 per section, no empty sections
    - **Property 9: Reading Duration Calculation** — Verify ceil(chars/300) for zh, ceil(words/200) for en/de, minimum 1 minute
    - **Validates: Requirements 4.3, 4.7, 5.1**

- [ ] 7. Article detail page
  - [ ] 7.1 Implement article detail page with ISR
    - Create `app/[locale]/article/[slug]/page.tsx` with ISR (revalidation ≤ 60 min)
    - Display title, author, publish date, category tags, reading duration
    - Render article body with 45-75 char line width, 16px+ font, 1.6+ line-height
    - Display cover images in WebP with JPEG fallback, 16:9 aspect ratio, lazy loading below fold
    - Show "translation pending" notice when translated version unavailable
    - Handle 404 for non-existent/unpublished articles with link to homepage
    - _Requirements: 5.1, 5.2, 5.6, 3.6, 11.3, 12.2_

  - [ ] 7.2 Implement related articles and reading progress
    - Create related articles component (3-6 articles sharing category tags, sorted by date desc)
    - Implement horizontal scroll progress bar for article body
    - Add social sharing buttons (Twitter, LinkedIn, WhatsApp)
    - _Requirements: 5.3, 5.4, 5.5_

  - [ ]* 7.3 Write property tests for article page logic
    - **Property 10: Related Articles Selection** — Verify 3-6 articles returned, all share category tag, ordered by date desc
    - **Validates: Requirements 5.3**

- [ ] 8. Category and search pages
  - [ ] 8.1 Implement category listing page with pagination
    - Create `app/[locale]/category/[slug]/page.tsx` with ISR
    - Display paginated article list (max 12 per page), sorted by publish date desc
    - Show title, publish date, 120-char excerpt per article
    - Display "no articles" message for empty categories
    - _Requirements: 7.2, 7.3_

  - [ ] 8.2 Implement search functionality
    - Create `app/api/search/route.ts` API endpoint
    - Implement full-text search across article titles and body in all languages
    - Accept queries ≥ 2 characters, return up to 20 results within 2 seconds
    - Display results with title, category, and text snippet with matched term
    - Display "no results" message when query returns empty
    - _Requirements: 7.4, 7.5, 7.6_

  - [ ]* 8.3 Write property tests for category and search
    - **Property 11: Category Pagination** — Verify max 12 per page, sorted by date desc, total pages = ceil(N/12)
    - **Property 12: Search Results Correctness** — Verify all results contain query in title/body, max 20 results
    - **Validates: Requirements 7.2, 7.4, 7.5**

- [ ] 9. Checkpoint - Frontend pages complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Newsletter service
  - [ ] 10.1 Implement subscription flow with double opt-in
    - Create `app/api/newsletter/subscribe/route.ts` — validate email, store with `pending` status, send confirmation email via Resend within 60s
    - Create `app/api/newsletter/confirm/route.ts` — verify token, activate subscription for browsing locale
    - Create `app/api/newsletter/unsubscribe/route.ts` — deactivate subscription, show confirmation page
    - Implement 48-hour confirmation expiry (discard unconfirmed subscriptions)
    - Detect and reject duplicate subscriptions for same email+locale
    - Create newsletter confirmation and unsubscribe UI pages
    - _Requirements: 8.1, 8.3, 8.5, 8.6, 8.7, 8.8_

  - [ ] 10.2 Implement weekly digest generation and sending
    - Create cron job for weekly digest compilation
    - Select up to 10 most recent articles from past 7 days, sorted by date desc
    - Generate locale-specific digest content (zh, en, de)
    - Send via Resend API with unsubscribe link in every email
    - _Requirements: 8.4, 8.5_

  - [ ]* 10.3 Write property tests for newsletter service
    - **Property 14: Email Format Validation** — Verify invalid formats rejected, valid formats accepted
    - **Property 15: Newsletter Digest Article Selection** — Verify max 10 articles, all within 7 days, sorted by date desc
    - **Property 16: Subscription State Integrity** — Verify no duplicates for same email+locale, 48-hour expiry enforced
    - **Validates: Requirements 8.2, 8.4, 8.7, 8.8**

- [ ] 11. SEO and metadata
  - [ ] 11.1 Implement Open Graph and meta tags
    - Generate OG tags on all article pages (og:title ≤ 95 chars, og:description ≤ 200 chars, og:image ≥ 1200×630px, og:url, og:locale)
    - Generate meta description (≤ 160 chars) on all article and category pages
    - Add canonical URL meta tag on every page (locale-specific)
    - Add hreflang tags (zh, en, de, x-default → en) on every page
    - _Requirements: 9.2, 9.4, 9.7, 9.8_

  - [ ] 11.2 Implement sitemap, RSS feeds, and JSON-LD
    - Create dynamic `sitemap.xml` with all published articles × 3 locales, category pages, lastmod dates, hreflang alternates
    - Create RSS feed endpoints (`/api/feed/[locale]/route.ts`) with 20 most recent articles per locale
    - Generate JSON-LD structured data (schema.org Article) on article pages: headline, datePublished, dateModified, author, description, inLanguage
    - _Requirements: 9.3, 9.5, 9.6_

  - [ ]* 11.3 Write property tests for SEO utilities
    - **Property 17: SEO Metadata Constraints** — Verify OG title ≤ 95, OG description ≤ 200, meta description ≤ 160, all non-empty and in correct locale language
    - **Property 18: Sitemap Generation Completeness** — Verify N×3 article URLs + category URLs, each with lastmod and hreflang for all 3 locales
    - **Property 19: Page Locale References** — Verify exactly 4 hreflang entries (zh, en, de, x-default→en), canonical matches page locale URL
    - **Property 20: JSON-LD Article Structured Data** — Verify valid JSON with all required fields, inLanguage matches page locale
    - **Property 21: RSS Feed Generation** — Verify max 20 items, sorted by date desc, each with title, date, summary, valid locale URL
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8**

- [ ] 12. Editor dashboard
  - [ ] 12.1 Implement editor dashboard with article management
    - Create `app/editor/layout.tsx` with auth-protected layout
    - Create dashboard overview page showing pending article count and recent activity
    - Implement pending articles list sorted by crawl date desc (title, source, crawl date, category)
    - Implement approve/reject actions (approve triggers translation, reject moves to rejected list)
    - Implement article editing: title (max 120 chars), summary (max 300 chars), categories (min 1), featured status
    - Implement featured article management (max 3 at any time)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 12.2 Implement category and source management
    - Create category management page: create, rename, archive categories
    - Enforce max 30 active categories, names ≤ 40 characters
    - Prompt reassignment when archiving category with published articles
    - Create WeChat source management page: add, remove, toggle active status
    - Display source health status (last crawl time, error state)
    - _Requirements: 10.6, 10.7, 1.8_

  - [ ]* 12.3 Write property tests for editor validation
    - **Property 22: Editor Input Validation** — Verify title >120 rejected, summary >300 rejected, zero categories rejected, featured >3 rejected, category name >40 rejected, active categories >30 rejected
    - **Property 23: Pending Articles Sort Order** — Verify list sorted by crawl date desc, all items have PENDING status
    - **Validates: Requirements 10.1, 10.4, 10.5, 10.6**

- [ ] 13. Checkpoint - All features implemented
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Performance optimization and deployment configuration
  - [ ] 14.1 Implement image optimization and caching
    - Configure Next.js Image component with CDN (Cloudflare R2)
    - Implement automatic format optimization (WebP/AVIF with JPEG fallback)
    - Implement lazy loading for below-fold images
    - Configure translation cache (24-hour minimum, invalidate on source update)
    - Configure ISR revalidation intervals (≤ 60 minutes)
    - _Requirements: 12.2, 12.3, 12.4, 11.3_

  - [ ] 14.2 Configure deployment and resilience
    - Configure Vercel deployment for Next.js frontend (SSR/ISR)
    - Configure Railway/Fly.io for backend services (crawler, translation queue, newsletter cron)
    - Implement graceful degradation: serve stale content up to 72 hours when services unavailable
    - Configure environment variables and secrets management
    - Set up Lighthouse CI thresholds (desktop ≥ 90, mobile ≥ 80)
    - _Requirements: 12.1, 12.5, 12.6_

- [ ] 15. Final checkpoint - Full system integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The project uses TypeScript throughout (Next.js 15 frontend + Node.js backend services)
- All 23 correctness properties from the design document are covered in property test tasks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1", "5.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.2", "3.3", "5.2", "5.3"] },
    { "id": 4, "tasks": ["2.4", "3.4", "5.4", "6.1", "6.2", "6.3"] },
    { "id": 5, "tasks": ["6.4", "7.1", "8.1", "8.2"] },
    { "id": 6, "tasks": ["7.2", "7.3", "8.3", "10.1"] },
    { "id": 7, "tasks": ["10.2", "10.3", "11.1", "11.2"] },
    { "id": 8, "tasks": ["11.3", "12.1"] },
    { "id": 9, "tasks": ["12.2", "12.3"] },
    { "id": 10, "tasks": ["14.1", "14.2"] }
  ]
}
```
