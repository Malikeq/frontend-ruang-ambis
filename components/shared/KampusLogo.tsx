'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface KampusLike {
  id: number;
  nama: string;
  akronim: string;
  logo_url?: string | null;
}

// ── logo.dev config ───────────────────────────────────────────
const LOGO_TOKEN = 'pk_a1dih9BDRCmE0bDH9EgSUg';
const LOGO_BASE  = 'https://img.logo.dev/name';   // /name/ endpoint for name-based search

function logoDevUrl(name: string): string {
  return `${LOGO_BASE}/${encodeURIComponent(name)}?token=${LOGO_TOKEN}&retina=true`;
}

// ── Size maps ─────────────────────────────────────────────────
const SIZE_MAP  = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' };
const PIXEL_MAP = { sm: 32, md: 40, lg: 56 };

const GRADIENT_COLORS = [
  'from-[#6366f1] to-[#8b5cf6]',
  'from-[#0ea5e9] to-[#6366f1]',
  'from-[#10b981] to-[#0ea5e9]',
  'from-[#f59e0b] to-[#ef4444]',
  'from-[#ec4899] to-[#8b5cf6]',
  'from-[#14b8a6] to-[#6366f1]',
  'from-[#f97316] to-[#ec4899]',
];

// ── Candidate URL builder ────────────────────────────────────
/**
 * Builds an ordered list of logo.dev /name/ URLs to try.
 * Order: stored url → full Indonesian name → English translation
 *        → acronym alone → name without common prefix
 */
function buildCandidates(kampus: KampusLike): string[] {
  const srcs: string[] = [];
  const { nama, akronim } = kampus;

  // 1. Already-verified URL from the database
  if (kampus.logo_url) srcs.push(kampus.logo_url);

  // 2. Full Indonesian name  e.g. "Universitas Indonesia"
  srcs.push(logoDevUrl(nama));

  // 3. English translation  e.g. "University of Indonesia"
  const english = toEnglishName(nama);
  if (english !== nama) srcs.push(logoDevUrl(english));

  // 4. Acronym alone  e.g. "UI", "ITB", "UGM"
  if (akronim && akronim.length >= 2) srcs.push(logoDevUrl(akronim));

  // 5. Name without common Indonesian prefix  e.g. "Indonesia" from "Universitas Indonesia"
  const stripped = stripPrefix(nama);
  if (stripped && stripped !== nama) srcs.push(logoDevUrl(stripped));

  return [...new Set(srcs)];
}

function toEnglishName(nama: string): string {
  const map: [string, string][] = [
    ['Institut Teknologi', 'Institute of Technology'],
    ['Universitas',        'University of'],
    ['Institut',           'Institute of'],
    ['Sekolah Tinggi',     'College of'],
    ['Politeknik',         'Polytechnic'],
    ['Akademi',            'Academy of'],
  ];
  for (const [id, en] of map) {
    if (nama.startsWith(id + ' ')) {
      return `${en} ${nama.slice(id.length + 1)}`;
    }
  }
  return nama;
}

function stripPrefix(nama: string): string {
  for (const p of ['Universitas ', 'Institut ', 'Sekolah Tinggi ', 'Politeknik ', 'Akademi ']) {
    if (nama.startsWith(p)) return nama.slice(p.length);
  }
  return nama;
}

// ── Component ─────────────────────────────────────────────────
interface KampusLogoProps {
  kampus: KampusLike;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function KampusLogo({ kampus, size = 'md', className }: KampusLogoProps) {
  const candidates  = buildCandidates(kampus);
  const [idx, setIdx] = useState(0);

  const sizeClass  = SIZE_MAP[size];
  const px         = PIXEL_MAP[size];
  const colorClass = GRADIENT_COLORS[kampus.id % GRADIENT_COLORS.length];
  const letters    = kampus.akronim.slice(0, 3).toUpperCase();

  const currentSrc = candidates[idx] ?? null;

  // All candidates exhausted → gradient initials
  if (!currentSrc) {
    return (
      <div className={cn(
        sizeClass,
        'shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br font-black text-white',
        colorClass,
        className,
      )}>
        {letters}
      </div>
    );
  }

  return (
    <div className={cn(
      sizeClass,
      'relative shrink-0 overflow-hidden rounded-xl bg-white/5',
      className,
    )}>
      <Image
        key={currentSrc}
        src={currentSrc}
        alt={kampus.akronim}
        width={px * 2}
        height={px * 2}
        className="h-full w-full object-contain p-[3px]"
        onError={() => setIdx(i => i + 1)}
        unoptimized
      />
    </div>
  );
}
