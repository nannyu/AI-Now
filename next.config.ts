import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    turbopack: {
        resolveAlias: {
            'next-intl/config': './src/i18n/request.ts',
        },
    },
    images: {
        formats: ['image/avif', 'image/webp'] as const,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
