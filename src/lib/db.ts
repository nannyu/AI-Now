import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'path';
import { hashPassword } from './password';

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

    // Insert default categories if empty
    const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
    if (catCount.count === 0) {
        const cats = [
            { name: 'AI Applications', slug: 'ai-applications' },
            { name: 'Funding & Investment', slug: 'funding' },
            { name: 'Technical Breakthroughs', slug: 'tech-breakthroughs' },
            { name: 'Founder Stories', slug: 'founder-stories' },
            { name: 'Industry Trends', slug: 'industry-trends' },
            { name: 'Global Expansion', slug: 'global-expansion' },
        ];
        const insert = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
        for (const cat of cats) {
            insert.run(cat.name, cat.slug);
        }
    }
}
