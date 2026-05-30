'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import { AlertTriangle, Clock, TrendingDown, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type RiskTab = 'tidak_aktif' | 'akurasi_rendah' | 'belum_latihan';

interface SiswaRisk {
  id: number;
  name: string;
  email: string;
  tier: string;
  streak_days: number;
  avg_snbt: number;
  last_active?: string;
  avg_akurasi?: number;
}

const TAB_CONFIG: { id: RiskTab; label: string; icon: any; desc: string; color: string }[] = [
  { id: 'tidak_aktif',    label: 'Tidak Aktif',    icon: Clock,         desc: 'Tidak aktif > 7 hari',       color: 'amber' },
  { id: 'akurasi_rendah', label: 'Akurasi Rendah', icon: TrendingDown,  desc: 'Rata-rata akurasi < 40%',    color: 'red' },
  { id: 'belum_latihan',  label: 'Belum Latihan',  icon: BookOpen,      desc: 'Belum pernah mengerjakan soal', color: 'slate' },
];

const COLOR_MAP: Record<string, { bg: string; badge: string; icon: string; border: string }> = {
  amber: { bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'text-amber-500', border: 'border-l-amber-400' },
  red:   { bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700 border-red-200',       icon: 'text-red-500',   border: 'border-l-red-400' },
  slate: { bg: 'bg-slate-50',  badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'text-slate-400', border: 'border-l-slate-300' },
};

function daysSince(dateStr?: string): string {
  if (!dateStr) return 'Tidak pernah';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  return days === 0 ? 'Hari ini' : `${days} hari lalu`;
}

export default function AtRiskPage() {
  const [tab, setTab] = useState<RiskTab>('tidak_aktif');

  const { data, isLoading } = useQuery({
    queryKey: ['pengamat-at-risk'],
    queryFn:  () => pengamatApi.atRisk(),
    staleTime: 60_000,
  });

  const riskData  = data?.data?.data;
  const summary   = data?.data?.summary ?? {};

  const currentList: SiswaRisk[] =
    tab === 'tidak_aktif'    ? (riskData?.tidak_aktif    ?? []) :
    tab === 'akurasi_rendah' ? (riskData?.akurasi_rendah ?? []) :
    (riskData?.belum_latihan ?? []);

  const totalAtRisk = (summary.tidak_aktif ?? 0) + (summary.akurasi_rendah ?? 0) + (summary.belum_latihan ?? 0);
  const activeCfg   = TAB_CONFIG.find(t => t.id === tab)!;
  const colors      = COLOR_MAP[activeCfg.color];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Siswa Perlu Perhatian</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalAtRisk} siswa membutuhkan tindakan segera
          </p>
        </div>
        <Link href="/pengamat/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-all">
          ← Dashboard
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TAB_CONFIG.map(t => {
          const count  = summary[t.id] ?? 0;
          const active = tab === t.id;
          const c      = COLOR_MAP[t.color];
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all',
                active ? `${c.bg} ${c.border.replace('border-l-', 'border-')} text-slate-800` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              )}>
              <t.icon className={cn('h-4 w-4', active ? c.icon : 'text-slate-400')} />
              {t.label}
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-black border', active ? c.badge : 'bg-slate-100 text-slate-500 border-slate-200')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5" />
        {activeCfg.desc}
      </p>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">✅</div>
          <p className="font-semibold text-slate-600">Tidak Ada Siswa</p>
          <p className="text-sm mt-1">Tidak ada siswa dalam kategori ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map(siswa => (
            <Link key={siswa.id} href={`/pengamat/dashboard/siswa/${siswa.id}`}
              className={cn('flex items-center gap-4 bg-white rounded-2xl border border-slate-100 border-l-4 p-4 shadow-sm hover:shadow-md transition-all', colors.border)}>

              {/* Avatar */}
              <div className={cn('h-10 w-10 rounded-2xl flex items-center justify-center text-base font-black shrink-0', colors.bg)}>
                <span className={colors.icon.replace('text-', 'text-').replace('-500', '-600').replace('-400', '-600')}>
                  {siswa.name.charAt(0)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{siswa.name}</p>
                <p className="text-xs text-slate-400 truncate">{siswa.email}</p>
                <div className="flex items-center gap-3 mt-1">
                  {tab === 'tidak_aktif' && (
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', colors.badge)}>
                      Terakhir: {daysSince(siswa.last_active)}
                    </span>
                  )}
                  {tab === 'akurasi_rendah' && (
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', colors.badge)}>
                      Akurasi: {Math.round(siswa.avg_akurasi ?? 0)}%
                    </span>
                  )}
                  {tab === 'belum_latihan' && (
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', colors.badge)}>
                      0 sesi latihan
                    </span>
                  )}
                  {siswa.streak_days > 0 && (
                    <span className="text-xs text-orange-500 font-semibold">🔥 {siswa.streak_days} hari</span>
                  )}
                </div>
              </div>

              {/* SNBT score */}
              {siswa.avg_snbt > 0 && (
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-slate-700">{Math.round(siswa.avg_snbt)}</p>
                  <p className="text-xs text-slate-400">SNBT</p>
                </div>
              )}

              <span className="text-slate-300 text-lg shrink-0">›</span>
            </Link>
          ))}

          {/* Bulk action info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <p className="text-sm text-slate-500">{currentList.length} siswa dalam kategori ini</p>
            </div>
            <button
              className="text-xs font-semibold text-slate-400 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-white transition-all cursor-not-allowed"
              title="Fitur segera hadir"
              disabled
            >
              📧 Kirim Pesan Massal (Segera)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
