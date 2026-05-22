import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'path';
import { hashPassword } from './password';
import { categories } from './mock-data';

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

    CREATE TABLE IF NOT EXISTS reader_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
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
      deleted_at TEXT,
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

    CREATE TABLE IF NOT EXISTS article_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      quote TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES reader_users(id) ON DELETE CASCADE
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
    if (!articleColumns.some((column) => column.name === 'deleted_at')) {
        db.exec('ALTER TABLE articles ADD COLUMN deleted_at TEXT');
    }
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug) WHERE slug IS NOT NULL AND slug != ''");
    db.exec('CREATE INDEX IF NOT EXISTS idx_article_comments_article_id_created_at ON article_comments(article_id, created_at DESC)');

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

    runMigrationOnce(db, 'remove_seed_articles_v1', () => {
        db.exec("DELETE FROM articles WHERE source_url LIKE 'seed:%'");
    });

    db.exec("DELETE FROM articles WHERE status = 'trash' AND deleted_at <= datetime('now', '-30 days')");

    restoreWechatPublishDatesFromLocalCache(db);

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

function restoreWechatPublishDatesFromLocalCache(db: Database.Database) {
    const cacheDbPath = path.join(process.cwd(), 'services', 'wechat-rss-lite', 'wechat-rss-lite.db');
    if (!fs.existsSync(cacheDbPath)) return;

    const name = 'restore_wechat_publish_dates_from_local_cache_v1';
    const applied = db.prepare('SELECT name FROM schema_migrations WHERE name = ?').get(name);
    if (applied) return;

    db.prepare('ATTACH DATABASE ? AS wrss').run(cacheDbPath);
    try {
        db.exec(`
            UPDATE articles
            SET publish_date = (
                SELECT wrss.articles.published_at
                FROM wrss.articles
                WHERE wrss.articles.url = articles.source_url
                  AND wrss.articles.published_at IS NOT NULL
            )
            WHERE source_url LIKE 'https://mp.weixin.qq.com/%'
              AND EXISTS (
                SELECT 1
                FROM wrss.articles
                WHERE wrss.articles.url = articles.source_url
                  AND wrss.articles.published_at IS NOT NULL
              )
        `);
        db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(name);
    } finally {
        db.exec('DETACH DATABASE wrss');
    }
}
