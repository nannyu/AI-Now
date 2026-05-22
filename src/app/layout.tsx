import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AI Roar - Chinese AI Startup Stories',
    description:
        'Discover the innovators building the future of artificial intelligence in China. Stories in Chinese, English, and German.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
