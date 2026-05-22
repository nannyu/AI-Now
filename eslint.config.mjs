import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
    {
        ignores: ['.next/**', '.vercel/**', 'next-env.d.ts', 'node_modules/**', 'services/wechat-rss-lite/**'],
    },
    ...nextVitals,
    ...nextTypescript,
    {
        rules: {
            '@next/next/no-html-link-for-pages': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            'react-hooks/set-state-in-effect': 'off',
            'react/no-unescaped-entities': 'off',
        },
    },
];

export default eslintConfig;
