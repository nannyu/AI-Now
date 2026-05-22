const EN_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const DE_MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const;

type DateParts = {
    year: number;
    month: number;
    day: number;
    hours: number | null;
    minutes: number | null;
};

const HAS_TIMEZONE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/** Parse stored dates without locale/timezone drift between SSR and browser. */
function parseDateParts(dateStr: string): DateParts | null {
    const value = dateStr.trim();
    if (!value) return null;

    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (dateOnly) {
        return {
            year: Number(dateOnly[1]),
            month: Number(dateOnly[2]) - 1,
            day: Number(dateOnly[3]),
            hours: null,
            minutes: null,
        };
    }

    const localDateTime = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
    if (localDateTime && !HAS_TIMEZONE.test(value)) {
        return {
            year: Number(localDateTime[1]),
            month: Number(localDateTime[2]) - 1,
            day: Number(localDateTime[3]),
            hours: Number(localDateTime[4]),
            minutes: Number(localDateTime[5]),
        };
    }

    const instant = new Date(value);
    if (Number.isNaN(instant.getTime())) return null;

    return {
        year: instant.getUTCFullYear(),
        month: instant.getUTCMonth(),
        day: instant.getUTCDate(),
        hours: instant.getUTCHours(),
        minutes: instant.getUTCMinutes(),
    };
}

function formatDateParts(parts: DateParts, locale: string): string {
    const { year, month, day } = parts;

    if (locale === 'zh') {
        return `${year}年${month + 1}月${day}日`;
    }
    if (locale === 'de') {
        return `${day}. ${DE_MONTHS[month]} ${year}`;
    }
    return `${EN_MONTHS[month]} ${day}, ${year}`;
}

/** Deterministic date labels — avoids SSR/client timezone mismatches. */
export function formatArticleDate(dateStr: string, locale: string): string {
    const parts = parseDateParts(dateStr);
    if (!parts) return dateStr;
    return formatDateParts(parts, locale);
}

export function formatArticleDateTime(dateStr: string, locale: string): string {
    const parts = parseDateParts(dateStr);
    if (!parts) return dateStr;

    const datePart = formatDateParts(parts, locale);
    if (parts.hours === null || parts.minutes === null) {
        return datePart;
    }

    const hours = String(parts.hours).padStart(2, '0');
    const minutes = String(parts.minutes).padStart(2, '0');
    return `${datePart} ${hours}:${minutes}`;
}
