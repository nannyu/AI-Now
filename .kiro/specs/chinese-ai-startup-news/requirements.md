# Requirements Document

## Introduction

本项目旨在构建一个面向全球读者的资讯网站，专注展示和推广中文AI创业者的创业案例。网站通过 wechat-rss-lite 从微信公众号抓取文章内容，提供中文、英文、德文三种语言版本，采用类似 Rest of World 的专业新闻媒体设计风格。

## Glossary

- **Website**: 本资讯网站系统，面向全球读者展示中文AI创业案例
- **Content_Crawler**: 基于 wechat-rss-lite 的内容爬取服务，负责从微信公众号抓取文章
- **Translation_Service**: AI翻译服务，负责将中文内容翻译为英文和德文
- **Article**: 从微信公众号抓取的单篇文章内容，包含标题、正文、作者、发布时间等元数据
- **Category**: 文章分类标签，用于按主题组织内容（如AI应用、融资、技术突破等）
- **Reader**: 访问网站的全球用户
- **Editor**: 网站内容管理员，负责审核和编辑文章
- **Newsletter**: 定期发送给订阅用户的邮件摘要
- **Locale**: 网站支持的语言版本（zh-CN、en、de）

## Requirements

### Requirement 1: Content Crawling and Ingestion

**User Story:** As an Editor, I want the system to automatically crawl articles from specified WeChat public accounts, so that the website always has fresh AI startup content.

#### Acceptance Criteria

1. WHEN a scheduled crawl interval is reached, THE Content_Crawler SHALL fetch new articles from all configured WeChat public accounts, where the default crawl interval is 60 minutes and is configurable between 15 minutes and 24 hours
2. WHEN a new article is fetched, THE Content_Crawler SHALL extract the title, body text, author, publish date, and cover image
3. WHEN a fetched article has the same source URL as an existing article in the database, THE Content_Crawler SHALL skip the duplicate article without creating a new entry
4. IF the Content_Crawler fails to connect to a WeChat public account, THEN THE Content_Crawler SHALL log the error and retry up to 3 times with a configurable delay (default 5 minutes) between attempts
5. IF the Content_Crawler has exhausted all retry attempts for a WeChat public account, THEN THE Content_Crawler SHALL mark that source as temporarily unavailable and notify the Editor
6. WHEN an article is successfully ingested, THE Content_Crawler SHALL store the article in a pending review state
7. IF a fetched article is missing the cover image or author field, THEN THE Content_Crawler SHALL still ingest the article with the available fields and mark the missing fields as empty
8. THE Content_Crawler SHALL support adding and removing WeChat public account sources through a configuration interface, supporting at least 50 configured sources

### Requirement 2: AI Translation

**User Story:** As a Reader, I want articles to be available in Chinese, English, and German, so that I can read content in my preferred language.

#### Acceptance Criteria

1. WHEN an article is approved for publication, THE Translation_Service SHALL translate the article title and body from Chinese to English
2. WHEN an article is approved for publication, THE Translation_Service SHALL translate the article title and body from Chinese to German
3. WHEN a translation is completed, THE Translation_Service SHALL preserve the original heading hierarchy, paragraph breaks, list formatting, hyperlinks, and embedded image references of the article
4. IF the Translation_Service fails to return a complete translation within 60 seconds or receives an error from the underlying translation provider, THEN THE Translation_Service SHALL mark the article with a translation error status and notify the Editor within 5 minutes of the failure
5. THE Translation_Service SHALL complete translation of a single article of up to 50,000 characters within 60 seconds
6. WHILE translating, THE Translation_Service SHALL preserve proper nouns, brand names, and technical terms that appear in the article's designated term list without translating them
7. WHEN a previously translated article is updated and re-approved for publication, THE Translation_Service SHALL re-translate the updated article title and body to English and German

### Requirement 3: Multi-language Website Display

**User Story:** As a Reader, I want to switch between Chinese, English, and German versions of the website, so that I can browse content in my preferred language.

#### Acceptance Criteria

1. THE Website SHALL provide a language switcher visible on every page, supporting Chinese (zh-CN), English (en), and German (de)
2. WHEN a Reader selects a language, THE Website SHALL display all UI elements, navigation, and article content in the selected language and update the URL to the corresponding locale-specific path
3. WHEN a Reader visits the website for the first time and the browser language preference matches a supported language (zh-CN, en, or de), THE Website SHALL display the website in that matching language
4. IF a first-time Reader's browser language does not match any supported language, THEN THE Website SHALL default to English (en)
5. THE Website SHALL use locale-specific URL paths (e.g., /en/article/slug, /de/article/slug, /zh/article/slug)
6. IF a translated version of an article is not available in the selected language, THEN THE Website SHALL display the Chinese original with a visible notice indicating translation is pending
7. WHEN a Reader selects a language, THE Website SHALL persist the selection so that subsequent visits within 30 days display the website in the previously selected language

### Requirement 4: Homepage Layout

**User Story:** As a Reader, I want a well-organized homepage that highlights the latest and most important AI startup stories, so that I can quickly find interesting content.

#### Acceptance Criteria

1. THE Website SHALL display a horizontally scrolling ticker at the top of the homepage showing the 10 most recently published article titles, each accompanied by its publish time and estimated reading duration
2. THE Website SHALL display a featured article section below the ticker, showing 1 primary featured article with a cover image at a 16:9 aspect ratio, the article title, and a summary truncated to a maximum of 200 characters
3. THE Website SHALL display articles grouped by category sections (e.g., AI应用, 融资动态, 技术突破, 创业人物), showing up to 4 articles per category with each article's title, cover image, and publish date
4. WHEN a new article is published, THE Website SHALL update the homepage content within 5 minutes
5. THE Website SHALL display an Editor's Picks carousel section containing between 3 and 8 editorially curated articles, each showing a cover image, title, and category label
6. THE Website SHALL display a Newsletter subscription section with an email input field and subscribe button
7. IF a category section contains no published articles, THEN THE Website SHALL hide that category section from the homepage layout

### Requirement 5: Article Detail Page

**User Story:** As a Reader, I want to read full articles with clear typography and related content suggestions, so that I can have a good reading experience and discover more content.

#### Acceptance Criteria

1. THE Website SHALL display the article title, author name, publish date, category tags, and estimated reading duration (calculated at 300 characters per minute for Chinese, 200 words per minute for English and German) on the article detail page
2. THE Website SHALL render the article body with a content column width between 45 and 75 characters per line, a body font size of at least 16px, and a line height of at least 1.6 to support long-form reading
3. THE Website SHALL display between 3 and 6 related articles at the bottom of the article detail page, where related articles are those sharing at least one category tag with the current article, ordered by publish date descending
4. THE Website SHALL provide social sharing buttons for the article (Twitter, LinkedIn, WhatsApp)
5. WHEN a Reader scrolls through the article, THE Website SHALL display a horizontal progress bar indicating the percentage of the article body that has been scrolled into view
6. IF a Reader navigates to an article URL that does not exist or is not published, THEN THE Website SHALL display a not-found message and provide a link to the homepage

### Requirement 6: Responsive Design

**User Story:** As a Reader, I want the website to work well on mobile devices, tablets, and desktops, so that I can read content on any device.

#### Acceptance Criteria

1. THE Website SHALL render all content readable and all interactive elements reachable without horizontal scrolling on viewports from 320px to 1920px wide
2. WHEN viewed on a screen width below 768px, THE Website SHALL display a single-column layout where the navigation collapses into a hamburger menu icon that, when tapped, reveals all navigation items in a vertical overlay or slide-in panel
3. WHEN viewed on a screen width between 768px and 1024px, THE Website SHALL display a two-column layout with the main content area occupying at least 65% of the width and a sidebar occupying the remaining width
4. WHEN viewed on a screen width above 1024px, THE Website SHALL display the full multi-column layout with a visible sidebar and navigation menu without requiring a hamburger toggle
5. THE Website SHALL achieve a Largest Contentful Paint (LCP) of 3 seconds or less when tested on a simulated Regular 3G connection (400 Kbps download, 400ms RTT)
6. WHILE the Website is viewed on a touch-capable device, THE Website SHALL support horizontal swipe gestures to navigate between items in the carousel and ticker components
7. WHEN the viewport is resized across any breakpoint (768px or 1024px), THE Website SHALL reflow content to the appropriate layout within 1 second without requiring a page reload

### Requirement 7: Navigation and Information Architecture

**User Story:** As a Reader, I want clear navigation to find content by category, latest articles, or search, so that I can efficiently discover relevant stories.

#### Acceptance Criteria

1. THE Website SHALL display a top navigation bar with links to: Home, Latest, Categories, About, and Newsletter, visible and accessible on viewports 320px wide and above
2. WHEN a Reader clicks on a category, THE Website SHALL display a paginated list of articles belonging to that category, sorted by publication date descending, showing at most 12 articles per page, where each article entry displays the title, publication date, and an excerpt of up to 120 characters
3. IF a category contains no articles, THEN THE Website SHALL display a message indicating that no articles are available in that category
4. THE Website SHALL provide a search function that accepts queries of at least 2 characters and searches article titles and body content across all languages
5. WHEN a Reader submits a search query, THE Website SHALL return up to 20 matching results within 2 seconds, displaying each result with its title, category, and a text snippet containing the matched term
6. IF a search query returns no results, THEN THE Website SHALL display a message indicating no articles matched the query
7. THE Website SHALL display breadcrumb navigation on category and article pages showing the path from Home to the current page

### Requirement 8: Newsletter Subscription

**User Story:** As a Reader, I want to subscribe to a newsletter, so that I can receive regular updates about new AI startup stories.

#### Acceptance Criteria

1. WHEN a Reader submits a valid email address in the subscription form, THE Website SHALL store the email address and send a confirmation email containing a unique confirmation link to the submitted address within 60 seconds
2. IF a Reader submits an invalid email format, THEN THE Website SHALL display an inline error message indicating the email format is incorrect without submitting the form
3. WHEN a Reader clicks the confirmation link in the confirmation email, THE Website SHALL add the Reader to the newsletter distribution list for the language version (zh-CN, en, or de) the Reader was browsing at the time of subscription
4. THE Website SHALL send a weekly newsletter digest containing up to 10 of the most recently published articles from the past 7 days, sorted by publish date descending
5. THE Website SHALL include an unsubscribe link in every newsletter email
6. WHEN a Reader clicks the unsubscribe link, THE Website SHALL remove the Reader from the newsletter distribution list and display a confirmation page acknowledging the unsubscription
7. IF a Reader submits an email address that is already subscribed to the same language newsletter, THEN THE Website SHALL display a message indicating the email is already subscribed without creating a duplicate entry
8. IF the confirmation link is not clicked within 48 hours of submission, THEN THE Website SHALL discard the pending subscription and not add the email to the distribution list

### Requirement 9: SEO and Social Sharing

**User Story:** As an Editor, I want the website to be well-optimized for search engines and social media sharing, so that the content reaches a wider global audience.

#### Acceptance Criteria

1. THE Website SHALL generate server-side rendered HTML pages for all article and category pages such that the full page content is present in the initial HTML response without requiring client-side JavaScript execution
2. THE Website SHALL include Open Graph meta tags (og:title, og:description, og:image, og:url, og:locale) on every article page, where og:title is no longer than 95 characters, og:description is no longer than 200 characters, and og:image references an image with minimum dimensions of 1200×630 pixels
3. THE Website SHALL generate a sitemap.xml file that includes all published articles and category pages in all supported languages (zh, en, de), with each URL entry including a lastmod date and hreflang alternate links
4. THE Website SHALL include hreflang tags on every page to indicate language alternatives for Chinese (zh), English (en), and German (de) versions, plus an x-default tag pointing to the English version
5. THE Website SHALL generate structured data (JSON-LD) for article pages following the schema.org Article schema, including at minimum: headline, datePublished, dateModified, author, description, and inLanguage fields
6. THE Website SHALL provide an RSS feed for each language version (zh, en, de) containing the 20 most recently published articles, with each feed item including title, publication date, summary, and article URL
7. THE Website SHALL include a canonical URL meta tag on every page to indicate the preferred URL for that content, and each language version SHALL reference its own canonical URL
8. THE Website SHALL include a meta description tag on every article and category page, with content no longer than 160 characters, written in the language matching the page's language version

### Requirement 10: Content Management

**User Story:** As an Editor, I want to review, edit, and manage crawled articles before publication, so that I can ensure content quality and relevance.

#### Acceptance Criteria

1. THE Website SHALL provide an Editor dashboard that displays pending articles sorted by crawl date (newest first), showing each article's title, source account, crawl date, and category
2. WHEN an Editor approves an article, THE Website SHALL publish the article within 30 seconds and trigger the translation process
3. WHEN an Editor rejects an article, THE Website SHALL mark the article as rejected, exclude the article from publication, and retain the article in a rejected list accessible from the dashboard for potential re-review
4. THE Website SHALL allow the Editor to edit article titles (maximum 120 characters), summaries (maximum 300 characters), categories (at least one required), and featured status before publication
5. THE Website SHALL allow the Editor to set up to 3 articles as featured articles for the homepage at any given time
6. THE Website SHALL allow the Editor to manage category definitions (create, rename, archive), limited to a maximum of 30 active categories with names no longer than 40 characters
7. IF an Editor attempts to archive a category that has published articles assigned, THEN THE Website SHALL prompt the Editor to reassign those articles to another category before completing the archive operation

### Requirement 11: Visual Design and Typography

**User Story:** As a Reader, I want a professional and modern visual design, so that I have a pleasant reading experience comparable to international news sites.

#### Acceptance Criteria

1. THE Website SHALL use a sans-serif font (Moderat-style) for headings and a serif font for body text, with body text rendered at no smaller than 16px and a line-height of at least 1.5
2. THE Website SHALL support a light color theme with a white or near-white background and dark text that meets a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18px bold or 24px regular and above)
3. THE Website SHALL display article cover images in responsive formats (WebP with JPEG fallback), maintaining a consistent aspect ratio (16:9) across viewport sizes without visible layout shift during loading
4. THE Website SHALL maintain a consistent visual hierarchy across all pages using a defined typography scale with at least 4 distinct heading levels (h1 through h4) where each level is visually distinguishable by a minimum size difference of 4px from the adjacent level, and spacing based on a consistent base unit (8px increments)
5. THE Website SHALL meet WCAG 2.1 Level AA contrast requirements for all text elements
6. IF the primary web font fails to load within 3 seconds, THEN THE Website SHALL render text using a system fallback font of the same category (sans-serif for headings, serif for body) without breaking the page layout

### Requirement 12: Performance and Deployment

**User Story:** As a Reader, I want the website to load quickly and be reliably available, so that I can access content without delays.

#### Acceptance Criteria

1. THE Website SHALL achieve a Lighthouse Performance score of 90 or above on desktop and 80 or above on mobile for all page types (homepage, article pages, listing pages)
2. THE Website SHALL use static site generation for article pages and incremental static regeneration with a revalidation interval of no more than 60 minutes for updated content
3. THE Website SHALL serve images through a CDN with automatic format optimization (WebP or AVIF where supported) and lazy loading for images positioned below the initial viewport
4. THE Website SHALL cache translated content for a minimum of 24 hours before re-requesting from the Translation_Service, and invalidate the cache when source content is updated
5. IF the Content_Crawler or Translation_Service is unavailable, THEN THE Website SHALL continue serving previously generated static content for up to 72 hours without interruption to readers
6. THE Website SHALL render the largest contentful paint within 2.5 seconds on a standard 4G mobile connection
