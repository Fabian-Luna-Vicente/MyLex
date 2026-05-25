import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, [pathname]);

    return null;
}