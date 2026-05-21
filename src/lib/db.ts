import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'path';
import { hashPassword } from './password';
import { articles as seedArticles, categories, getLocalizedArticle } from './mock-data';
import { normalizeCategorySlug } from './article-categories';
import { sanitizeArticleHtml } from './html-sanitizer';

const DB_PATH = path.join(process.cwd(), 'data', 'ainow.db');

let db: Database.Database;

export function getDb(): Database.Database {
    if (!db) {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initializeDb(db);
    }
    return db;
}

function initializeDb(db: Database.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rss_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      feed_url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      last_fetched_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER,
      source_url TEXT UNIQUE,
      slug TEXT UNIQUE,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      body TEXT DEFAULT '',
      author TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      category TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      is_featured INTEGER DEFAULT 0,
      publish_date TEXT,
      crawled_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (source_id) REFERENCES rss_sources(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

    const articleColumns = db.prepare('PRAGMA table_info(articles)').all() as Array<{ name: string }>;
    if (!articleColumns.some((column) => column.name === 'slug')) {
        db.exec('ALTER TABLE articles ADD COLUMN slug TEXT');
    }
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug) WHERE slug IS NOT NULL AND slug != ''");

    runMigrationOnce(db, 'draft_clear_publish_date_v1', () => {
        db.exec(`
      UPDATE articles
      SET publish_date = NULL
      WHERE status = 'draft' AND publish_date IS NOT NULL
    `);
    });

    runMigrationOnce(db, 'rss_sources_dedup_v1', () => {
        db.exec(`
      UPDATE articles
      SET source_id = (
        SELECT MIN(keeper.id)
        FROM rss_sources AS duplicate
        JOIN rss_sources AS keeper ON keeper.feed_url = duplicate.feed_url
        WHERE duplicate.id = articles.source_id
      )
      WHERE source_id IN (
        SELECT duplicate.id
        FROM rss_sources AS duplicate
        JOIN rss_sources AS keeper ON keeper.feed_url = duplicate.feed_url
        WHERE duplicate.id != keeper.id
      );

      DELETE FROM rss_sources
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM rss_sources
        GROUP BY feed_url
      );
    `);
    });

    db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_rss_sources_feed_url
    ON rss_sources(feed_url);
  `);

    const legacyDefault = db.prepare(
        'SELECT id FROM admin_users WHERE username = ? AND password_hash = ?'
    ).get('admin', 'admin123') as { id: number } | undefined;
    if (legacyDefault) {
        db.prepare('DELETE FROM admin_users WHERE id = ?').run(legacyDefault.id);
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminUsername && adminPassword) {
        if (adminPassword.length < 12) {
            throw new Error('ADMIN_PASSWORD must be at least 12 characters');
        }

        const adminExists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(adminUsername);
        if (!adminExists) {
            db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(
                adminUsername,
                hashPassword(adminPassword)
            );
        }
    }

    const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)');
    for (const cat of categories) {
        insertCategory.run(cat.name, cat.slug);
    }

    seedDefaultArticles(db);
}

function runMigrationOnce(db: Database.Database, name: string, migrate: () => void) {
    const applied = db.prepare('SELECT name FROM schema_migrations WHERE name = ?').get(name);
    if (applied) return;

    const run = db.transaction(() => {
        migrate();
        db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(name);
    });
    run();
}

function seedDefaultArticles(db: Database.Database) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO articles (
        source_url,
        slug,
        title,
        summary,
        body,
        author,
        cover_image,
        category,
        status,
        is_featured,
        publish_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
    `);

    const updateMissingSlug = db.prepare('UPDATE articles SET slug = ? WHERE source_url = ? AND (slug IS NULL OR slug = ?)');

    const seedMany = db.transaction(() => {
        for (const article of seedArticles) {
            const localized = getLocalizedArticle(article, 'zh');
            const primaryCategory = article.categories[0]?.slug || normalizeCategorySlug(localized.categoryLabel);
            const sourceUrl = `seed:${article.slug}`;
            const seedBody = /<\/?[a-z][\s\S]*>/i.test(localized.body)
                ? sanitizeArticleHtml(localized.body)
                : localized.body;

            insert.run(
                sourceUrl,
                article.slug,
                localized.title,
                localized.summary,
                seedBody,
                localized.author,
                localized.coverImage,
                normalizeCategorySlug(primaryCategory),
                article.isFeatured ? 1 : 0,
                article.publishDate
            );
            updateMissingSlug.run(article.slug, sourceUrl, '');
        }
    });

    seedMany();
}
