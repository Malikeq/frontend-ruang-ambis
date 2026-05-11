import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'AI Lolos PTN', template: '%s | AI Lolos PTN' },
  description: 'Platform belajar SNBT berbasis AI. Analisis kelemahan personal, pembahasan 5-langkah DCSEF, dan scan foto soal.',
  keywords: ['SNBT', 'UTBK', 'belajar PTN', 'AI tutor', 'soal SNBT'],
  openGraph: { type: 'website', locale: 'id_ID', siteName: 'AI Lolos PTN' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        {/*
          ThemeProvider (client) applies any stored localStorage override on mount.
          Automatic OS detection works via CSS prefers-color-scheme in globals.css —
          no blocking script needed, no FOUC.
        */}
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
