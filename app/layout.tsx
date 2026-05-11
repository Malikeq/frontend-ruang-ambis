import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'AI Lolos PTN', template: '%s | AI Lolos PTN' },
  description: 'Platform belajar SNBT berbasis AI. Analisis kelemahan personal, pembahasan 5-langkah DCSEF, dan scan foto soal.',
  keywords: ['SNBT', 'UTBK', 'belajar PTN', 'AI tutor', 'soal SNBT'],
  openGraph: { type: 'website', locale: 'id_ID', siteName: 'AI Lolos PTN' },
};

// Inline script — runs before React hydrates, prevents flash of wrong theme
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent FOUC — inject theme class before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
