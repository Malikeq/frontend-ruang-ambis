'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import { Search, ChevronRight, Flame, Trophy } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

const TIER_BADGE: Record<string, string> = {
  premium:    'bg-violet-100 text-violet-700',
  daily_pass: 'bg-amber-100 text-amber-700',
  free:       'bg-slate-100 text-slate-500',
};
const TIER_LABEL: Record<string, string> = {
  premium: 'Premium', daily_pass: 'Daily', free: 'Free',
};

export default function PengamatSiswaPage() {
  const [search,  setSearch]  = useState('');
  const [sortBy,  setSortBy]  = useState('last_active');
  const [page,    setPage]    = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['pengamat-siswa', search, sortBy, page],
    queryFn:  () => pengamatApi.siswa({ search, sort_by: sortBy, page, per_page: 20 }),
    staleTime: 30_000,
  });

  const d    = data?.data?.data;
  const meta = d?.meta ?? d;
  const siswa: any[] = d?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Daftar Siswa</h1>
        <p className="text-sm text-slate-500 mt-1">Semua siswa terdaftar dari sekolahmu</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama atau email..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none">
          <option value="last_active">Terbaru Aktif</option>
          <option value="streak">Streak Tertinggi</option>
          <option value="points">Poin Tertinggi</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : siswa.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">Tidak ada siswa ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-bold text-slate-400 px-5 py-3">Siswa</th>
                <th className="text-center text-xs font-bold text-slate-400 px-3 py-3 hidden sm:table-cell">Tier</th>
                <th className="text-center text-xs font-bold text-slate-400 px-3 py-3 hidden md:table-cell">Sesi</th>
                <th className="text-center text-xs font-bold text-slate-400 px-3 py-3">Avg SNBT</th>
                <th className="text-center text-xs font-bold text-slate-400 px-3 py-3 hidden lg:table-cell">Streak</th>
                <th className="text-center text-xs font-bold text-slate-400 px-3 py-3 hidden lg:table-cell">Aktif</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {siswa.map((s: any) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400 hidden sm:block">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center hidden sm:table-cell">
                    <span className={cn('text-xs font-bold rounded-full px-2.5 py-1', TIER_BADGE[s.tier] ?? TIER_BADGE.free)}>
                      {TIER_LABEL[s.tier] ?? s.tier}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center hidden md:table-cell">
                    <p className="text-sm font-bold text-slate-700">{s.total_sesi}</p>
                    <p className="text-xs text-slate-400">{s.sesi_7d} minggu ini</p>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <p className={cn('text-sm font-black', s.avg_snbt >= 600 ? 'text-emerald-600' : s.avg_snbt >= 500 ? 'text-sky-600' : 'text-slate-500')}>
                      {s.avg_snbt > 0 ? s.avg_snbt : '–'}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 text-center hidden lg:table-cell">
                    <span className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-600">
                      <Flame className="h-3 w-3" /> {s.streak_days}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center hidden lg:table-cell">
                    <p className="text-xs text-slate-400">{s.last_active ? formatDate(s.last_active) : 'Belum'}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <Link href={`/pengamat/dashboard/siswa/${s.id}`}>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1">
                        Detail <ChevronRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta?.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              {meta.from}–{meta.to} dari {meta.total} siswa
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50">← Prev</button>
              <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
