import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import { isPostgresEnabled, pgQuery } from './postgres';

export type AdminJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export type AdminJob = {
    id: string;
    type: string;
    status: AdminJobStatus;
    label: string;
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    message: string;
    result: Record<string, unknown>;
    error: string;
    created_at: string;
    updated_at: string;
    finished_at: string | null;
};

type JobPatch = Partial<Pick<AdminJob, 'status' | 'label' | 'total' | 'processed' | 'succeeded' | 'failed' | 'message' | 'error'>> & {
    result?: Record<string, unknown>;
    finished?: boolean;
};

let sqliteEnsured = false;
let postgresEnsured: Promise<void> | null = null;

export async function createAdminJob(input: {
    type: string;
    label: string;
    total?: number;
    message?: string;
}) {
    await ensureAdminJobsTable();
    const now = new Date().toISOString();
    const job: AdminJob = {
        id: randomUUID(),
        type: input.type,
        status: 'queued',
        label: input.label,
        total: input.total ?? 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        message: input.message ?? '任务已加入后台队列',
        result: {},
        error: '',
        created_at: now,
        updated_at: now,
        finished_at: null,
    };

    if (isPostgresEnabled()) {
        await pgQuery(
            `
                INSERT INTO admin_jobs (
                    id, type, status, label, total, processed, succeeded, failed,
                    message, result, error, created_at, updated_at, finished_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `,
            [
                job.id,
                job.type,
                job.status,
                job.label,
                job.total,
                job.processed,
                job.succeeded,
                job.failed,
                job.message,
                JSON.stringify(job.result),
                job.error,
                job.created_at,
                job.updated_at,
                job.finished_at,
            ]
        );
        return job;
    }

    getDb().prepare(
        `
            INSERT INTO admin_jobs (
                id, type, status, label, total, processed, succeeded, failed,
                message, result, error, created_at, updated_at, finished_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
    ).run(
        job.id,
        job.type,
        job.status,
        job.label,
        job.total,
        job.processed,
        job.succeeded,
        job.failed,
        job.message,
        JSON.stringify(job.result),
        job.error,
        job.created_at,
        job.updated_at,
        job.finished_at
    );
    return job;
}

export async function updateAdminJob(id: string, patch: JobPatch) {
    await ensureAdminJobsTable();
    const current = await getAdminJob(id);
    if (!current) return null;
    const next: AdminJob = {
        ...current,
        ...patch,
        result: patch.result ?? current.result,
        updated_at: new Date().toISOString(),
        finished_at: patch.finished ? new Date().toISOString() : current.finished_at,
    };

    if (isPostgresEnabled()) {
        await pgQuery(
            `
                UPDATE admin_jobs
                SET status = $2, label = $3, total = $4, processed = $5,
                    succeeded = $6, failed = $7, message = $8, result = $9,
                    error = $10, updated_at = $11, finished_at = $12
                WHERE id = $1
            `,
            [
                id,
                next.status,
                next.label,
                next.total,
                next.processed,
                next.succeeded,
                next.failed,
                next.message,
                JSON.stringify(next.result),
                next.error,
                next.updated_at,
                next.finished_at,
            ]
        );
        return next;
    }

    getDb().prepare(
        `
            UPDATE admin_jobs
            SET status = ?, label = ?, total = ?, processed = ?, succeeded = ?,
                failed = ?, message = ?, result = ?, error = ?, updated_at = ?, finished_at = ?
            WHERE id = ?
        `
    ).run(
        next.status,
        next.label,
        next.total,
        next.processed,
        next.succeeded,
        next.failed,
        next.message,
        JSON.stringify(next.result),
        next.error,
        next.updated_at,
        next.finished_at,
        id
    );
    return next;
}

export async function getAdminJob(id: string) {
    await ensureAdminJobsTable();
    if (isPostgresEnabled()) {
        const row = (await pgQuery('SELECT * FROM admin_jobs WHERE id = $1', [id])).rows[0];
        return row ? normalizeJob(row as Record<string, unknown>) : null;
    }
    const row = getDb().prepare('SELECT * FROM admin_jobs WHERE id = ?').get(id);
    return row ? normalizeJob(row as Record<string, unknown>) : null;
}

export async function listAdminJobs(limit = 20) {
    await ensureAdminJobsTable();
    const normalizedLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
    if (isPostgresEnabled()) {
        const rows = (await pgQuery('SELECT * FROM admin_jobs ORDER BY created_at DESC LIMIT $1', [normalizedLimit])).rows;
        return rows.map((row) => normalizeJob(row as Record<string, unknown>));
    }
    const rows = getDb().prepare('SELECT * FROM admin_jobs ORDER BY created_at DESC LIMIT ?').all(normalizedLimit);
    return rows.map((row) => normalizeJob(row as Record<string, unknown>));
}

export async function runAdminJob(id: string, runner: () => Promise<Record<string, unknown>>) {
    await updateAdminJob(id, { status: 'running', message: '后台任务运行中' });
    try {
        const result = await runner();
        const current = await getAdminJob(id);
        await updateAdminJob(id, {
            status: 'succeeded',
            processed: current?.processed,
            succeeded: current?.succeeded,
            failed: current?.failed,
            message: '任务完成',
            result,
            finished: true,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : '后台任务失败';
        const current = await getAdminJob(id);
        await updateAdminJob(id, {
            status: 'failed',
            processed: current?.processed,
            succeeded: current?.succeeded,
            failed: (current?.failed ?? 0) + 1,
            message: '任务失败',
            error: message,
            finished: true,
        });
    }
}

async function ensureAdminJobsTable() {
    if (isPostgresEnabled()) {
        if (!postgresEnsured) {
            postgresEnsured = pgQuery(`
                CREATE TABLE IF NOT EXISTS admin_jobs (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'queued',
                    label TEXT NOT NULL DEFAULT '',
                    total INTEGER NOT NULL DEFAULT 0,
                    processed INTEGER NOT NULL DEFAULT 0,
                    succeeded INTEGER NOT NULL DEFAULT 0,
                    failed INTEGER NOT NULL DEFAULT 0,
                    message TEXT NOT NULL DEFAULT '',
                    result TEXT NOT NULL DEFAULT '{}',
                    error TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    finished_at TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_admin_jobs_created_at ON admin_jobs(created_at DESC);
            `).then(() => undefined);
        }
        await postgresEnsured;
        return;
    }

    if (sqliteEnsured) return;
    getDb().exec(`
        CREATE TABLE IF NOT EXISTS admin_jobs (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'queued',
            label TEXT NOT NULL DEFAULT '',
            total INTEGER NOT NULL DEFAULT 0,
            processed INTEGER NOT NULL DEFAULT 0,
            succeeded INTEGER NOT NULL DEFAULT 0,
            failed INTEGER NOT NULL DEFAULT 0,
            message TEXT NOT NULL DEFAULT '',
            result TEXT NOT NULL DEFAULT '{}',
            error TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            finished_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_admin_jobs_created_at ON admin_jobs(created_at DESC);
    `);
    sqliteEnsured = true;
}

function normalizeJob(row: Record<string, unknown>): AdminJob {
    let result: Record<string, unknown> = {};
    try {
        const parsed = JSON.parse(String(row.result || '{}'));
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            result = parsed as Record<string, unknown>;
        }
    } catch {}

    return {
        id: String(row.id),
        type: String(row.type),
        status: String(row.status) as AdminJobStatus,
        label: String(row.label || ''),
        total: Number(row.total || 0),
        processed: Number(row.processed || 0),
        succeeded: Number(row.succeeded || 0),
        failed: Number(row.failed || 0),
        message: String(row.message || ''),
        result,
        error: String(row.error || ''),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
        finished_at: row.finished_at ? String(row.finished_at) : null,
    };
}
