import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
    ...nextVitals,
    ...nextTypescript,
    {
        ignores: ['.next/**', 'next-env.d.ts', 'node_modules/**'],
        rules: {
            '@next/next/no-html-link-for-pages': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            'react-hooks/set-state-in-effect': 'off',
            'react/no-unescaped-entities': 'off',
        },
    },
];

export default eslintConfig;
