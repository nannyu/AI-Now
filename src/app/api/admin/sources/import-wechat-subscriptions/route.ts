import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { createAdminJob, runAdminJob, updateAdminJob } from '@/lib/admin-jobs';
import { requireAdminRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { validateFeedUrl } from '@/lib/url-security';
import { isPostgresEnabled, pgQuery } from '@/lib/postgres';

type ImportSource = {
    id?: string;
    title?: string;
    feed_url?: string;
};

export async function POST(request: NextRequest) {
    try {
        await requireAdminRequest(request);
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({})) as { sources?: ImportSource[] };
    const sources = Array.isArray(body.sources) ? body.sources : [];
    if (sources.length === 0) {
        return NextResponse.json({ error: 'At least one source is required' }, { status: 400 });
    }

    const job = await createAdminJob({
        type: 'wechat-subscriptions.import-sources',
        label: `导入 ${sources.length} 个公众号 RSS 来源`,
        total: sources.length,
        message: '准备导入 RSS 来源',
    });

    after(() => runAdminJob(job.id, async () => {
        let added = 0;
        let skipped = 0;
        let failed = 0;
        const errors: string[] = [];

        for (let index = 0; index < sources.length; index++) {
            const item = sources[index];
            try {
                const name = String(item.title || item.id || '').trim();
                const rawFeedUrl = String(item.feed_url || '').trim();
                if (!name || !rawFeedUrl) {
                    throw new Error('缺少来源名称或 feed_url');
                }
                const feedUrl = await validateFeedUrl(rawFeedUrl);
                if (!feedUrl.ok) {
                    throw new Error(feedUrl.error);
                }

                if (isPostgresEnabled()) {
                    const existing = (await pgQuery('SELECT id FROM rss_sources WHERE feed_url = $1', [feedUrl.url])).rows[0];
                    if (existing) {
                        skipped++;
                    } else {
                        await pgQuery('INSERT INTO rss_sources (name, feed_url) VALUES ($1, $2)', [name, feedUrl.url]);
                        added++;
                    }
                } else {
                    const db = getDb();
                    const existing = db.prepare('SELECT id FROM rss_sources WHERE feed_url = ?').get(feedUrl.url);
                    if (existing) {
                        skipped++;
                    } else {
                        db.prepare('INSERT INTO rss_sources (name, feed_url) VALUES (?, ?)').run(name, feedUrl.url);
                        added++;
                    }
                }
            } catch (err) {
                failed++;
                const message = err instanceof Error ? err.message : '导入失败';
                errors.push(`${item.title || item.id || '未知订阅'}: ${message}`);
            }

            await updateAdminJob(job.id, {
                processed: index + 1,
                succeeded: added,
                failed,
                message: `已处理 ${index + 1}/${sources.length} 个来源，跳过 ${skipped} 个重复`,
            });
        }

        return { added, skipped, failed, errors };
    }));

    return NextResponse.json({ job_id: job.id, job });
}
