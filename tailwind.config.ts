import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
                mono: ['var(--font-fira-code)', 'monospace'],
                cinzel: ['var(--font-cinzel)', 'serif'],
                'serif-vintage': ['var(--font-playfair-display)', 'Georgia', 'serif'],
                'sans-intel': ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif'],
                'mono-raw': ['var(--font-fira-code)', 'monospace'],
                'zcool-xiaowei': ['var(--font-zcool-xiaowei)', 'serif'],
                'noto-serif-sc': ['var(--font-noto-serif-sc)', 'serif'],
            },
            colors: {
                brand: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc8fb',
                    400: '#36adf6',
                    500: '#0c93e7',
                    600: '#0074c5',
                    700: '#015da0',
                    800: '#064f84',
                    900: '#0b426e',
                    950: '#072a49',
                },
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                vintage: {
                    bg: '#FAF8F5',
                    text: '#1C1C1A',
                    accent: '#252ef7',
                    'accent-pink': '#fc82e7',
                    border: '#D4C9BA',
                    'border-dark': '#C5BBAE',
                    panel: '#F2EDE4',
                }
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.625rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
                '5xl': ['3rem', { lineHeight: '3.5rem' }],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            maxWidth: {
                'article': '680px',
                'content': '1200px',
                'wide': '1400px',
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '680px',
                        lineHeight: '1.7',
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
