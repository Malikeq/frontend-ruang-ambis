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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-[#080810] text-[#f1f5f9] antialiased" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
