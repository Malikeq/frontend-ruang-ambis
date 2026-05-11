'use client';

import { useEffect } from 'react';

/**
 * Applies the stored theme preference (localStorage) on first mount.
 * CSS prefers-color-scheme handles the automatic OS-level detection,
 * so there's no flash even without a blocking script.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        const html = document.documentElement;
        html.classList.remove('dark', 'light');
        html.classList.add(stored);
        html.setAttribute('data-theme', stored);
      }
    } catch {}
  }, []);

  return <>{children}</>;
}
