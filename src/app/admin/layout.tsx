import '../globals.css';
import { inter } from '@/app/fonts';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN" className={inter.variable}>
            <body className="min-h-screen bg-neutral-50 font-sans text-neutral-900 overflow-x-hidden">
                {children}
            </body>
        </html>
    );
}
