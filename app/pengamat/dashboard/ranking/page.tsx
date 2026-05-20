'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import { Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const PERIODS = [
  { key: 'minggu', label: 'Minggu Ini' },
  { key: 'bulan',  label: 'Bulan Ini' },
  { key: 'all',    label: 'Semua Waktu' },
];

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function PengamatRankingPage() {
  const [periode, setPeriode] = useState('minggu');

  const { data, isLoading } = useQuery({
    queryKey: ['pengamat-ranking', periode],
    queryFn:  () => pengamatApi.ranking(periode),
    staleTime: 60_000,
  });
  const siswa: any[] = data?.data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Ranking Siswa
          </h1>
          <p className="text-sm text-slate-500 mt-1">Peringkat berdasarkan estimasi skor SNBT</p>
        </div>
        {/* Period toggle */}
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriode(p.key)}
              className={cn('px-3 py-2 text-xs font-semibold transition-all',
                periode === p.key ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50')}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : siswa.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <p className="text-slate-400">Belum ada data latihan pada periode ini.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {siswa.map((s: any) => {
            const isTop3 = s.rank <= 3;
            return (
              <div key={s.id} className={cn(
                'bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 transition-all hover:shadow-md',
                isTop3 ? 'border-amber-200 shadow-sm' : 'border-slate-100',
              )}>
                {/* Rank */}
                <div className="w-10 text-center shrink-0">
                  {RANK_MEDAL[s.rank] ? (
                    <span className="text-2xl">{RANK_MEDAL[s.rank]}</span>
                  ) : (
                    <span className="text-sm font-black text-slate-400">#{s.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={cn(
                  'h-11 w-11 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0',
                  isTop3
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                    : 'bg-gradient-to-br from-emerald-400 to-sky-500',
                )}>
                  {s.name?.[0]?.toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{s.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Flame className="h-3 w-3" /> {s.streak_days}
                    </span>
                    <span className="text-xs text-slate-400">{s.total_sesi} sesi</span>
                    <span className={cn(
                      'text-xs font-bold rounded-full px-2 py-0.5',
                      s.tier === 'premium' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500',
                    )}>{s.tier}</span>
                  </div>
                </div>

                {/* SNBT Score */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-2xl font-black',
                    s.avg_snbt >= 700 ? 'text-emerald-600' :
                    s.avg_snbt >= 600 ? 'text-sky-600' :
                    s.avg_snbt >= 500 ? 'text-amber-600' : 'text-slate-400',
                  )}>
                    {s.avg_snbt > 0 ? s.avg_snbt : '–'}
                  </p>
                  <p className="text-xs text-slate-400">Est. SNBT</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
