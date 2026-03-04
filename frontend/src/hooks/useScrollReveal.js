import { useEffect, useRef } from 'react';

export default function useScrollReveal(options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    observer.disconnect();
                }
            },
            { threshold: options.threshold || 0.12, rootMargin: options.rootMargin || '0px' }
        );
        el.classList.add('reveal');
        observer.observe(el);
        return () => observer.disconnect();
    }, [options.threshold, options.rootMargin]);

    return ref;
}
