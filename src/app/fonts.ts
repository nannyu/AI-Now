import {
    Cinzel,
    Fira_Code,
    Inter,
    Noto_Serif_SC,
    Playfair_Display,
    Plus_Jakarta_Sans,
    ZCOOL_XiaoWei,
} from 'next/font/google';

export const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
});

const cinzel = Cinzel({
    subsets: ['latin'],
    weight: ['600', '800'],
    variable: '--font-cinzel',
    display: 'swap',
});

const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-playfair-display',
    display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-plus-jakarta-sans',
    display: 'swap',
});

const firaCode = Fira_Code({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-fira-code',
    display: 'swap',
});

const zcoolXiaoWei = ZCOOL_XiaoWei({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-zcool-xiaowei',
    display: 'swap',
});

const notoSerifSc = Noto_Serif_SC({
    subsets: ['latin'],
    weight: ['700', '900'],
    variable: '--font-noto-serif-sc',
    display: 'swap',
});

export const editorialFontVariables = [
    inter.variable,
    cinzel.variable,
    playfairDisplay.variable,
    plusJakartaSans.variable,
    firaCode.variable,
    zcoolXiaoWei.variable,
    notoSerifSc.variable,
].join(' ');
