'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import clsx from 'clsx';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={clsx(
                'fixed bottom-8 right-8 z-50 w-10 h-10 flex items-center justify-center border-4 border-double border-vintage-accent bg-vintage-bg text-vintage-accent shadow-md transition-all duration-300 hover:bg-vintage-accent hover:text-vintage-bg active:scale-95 focus:outline-none focus:ring-1 focus:ring-vintage-accent',
                isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            )}
            aria-label="Back to top"
        >
            <ArrowUp className="w-4 h-4 transition-transform duration-300" />
        </button>
    );
}
