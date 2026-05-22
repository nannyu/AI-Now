import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['en', 'zh', 'de'],
    defaultLocale: 'en',
    localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string): value is Locale {
    return (routing.locales as readonly string[]).includes(value);
}

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
