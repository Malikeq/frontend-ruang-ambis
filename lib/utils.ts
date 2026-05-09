import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MAPEL_LIST, DIFFICULTY_COLORS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function calcPercentage(value: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export function getMapelColor(kode: string): string {
  return MAPEL_LIST.find((m) => m.kode === kode)?.colorClass ?? 'bg-slate-500/20 text-slate-300';
}

export function getDifficultyColor(level: string): string {
  return DIFFICULTY_COLORS[level] ?? 'border-slate-500/30 text-slate-400';
}

export function getTierColor(tier: string): string {
  const map: Record<string, string> = {
    premium:    'text-[#c4b5fd]',
    daily_pass: 'text-[#67e8f9]',
    free:       'text-[#94a3b8]',
  };
  return map[tier] ?? 'text-[#94a3b8]';
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
