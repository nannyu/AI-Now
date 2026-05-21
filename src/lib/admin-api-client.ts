'use client';

function getCookie(name: string) {
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    const csrfToken = getCookie('ainow-admin-csrf');

    if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
    }

    return fetch(input, {
        ...init,
        headers,
        credentials: 'same-origin',
    });
}
