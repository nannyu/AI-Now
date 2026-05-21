'use client';

import { useTranslations } from 'next-intl';
import { Twitter, Linkedin, MessageCircle, Share2 } from 'lucide-react';

interface Props {
    title: string;
}

export function ShareButtons({ title }: Props) {
    const t = useTranslations('article');

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const shareLinks = [
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
        },
    ];

    return (
        <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <Share2 className="w-4 h-4" />
                {t('shareOn')}
            </span>
            <div className="flex items-center gap-2">
                {shareLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                        aria-label={`Share on ${link.name}`}
                    >
                        <link.icon className="w-4 h-4" />
                    </a>
                ))}
            </div>
        </div>
    );
}
