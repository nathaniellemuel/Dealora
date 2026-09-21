import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'dealora-theme';

function getInitialTheme() {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    }, []);

    return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
    return ctx;
}
