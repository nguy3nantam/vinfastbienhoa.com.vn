import { useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useLayoutEffect(() => {
        if (hash) {
            let id;
            try {
                id = decodeURIComponent(hash.slice(1));
            } catch {
                id = hash.slice(1);
            }
            const scrollToTarget = () => {
                const target = document.getElementById(id);
                if (!target) return false;
                window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - 80, behavior: 'instant' });
                return true;
            };
            if (scrollToTarget()) return;
            // Lazy routes may mount after the router's scroll effect.
            const observer = new MutationObserver(() => {
                if (scrollToTarget()) {
                    observer.disconnect();
                    clearTimeout(timeout);
                }
            });
            observer.observe(document.getElementById('root'), { childList: true, subtree: true });
            const timeout = setTimeout(() => observer.disconnect(), 5000);
            return () => {
                observer.disconnect();
                clearTimeout(timeout);
            };
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash]);

    return null;
}

export default ScrollToTop;
