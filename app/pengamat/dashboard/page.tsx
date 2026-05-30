'use client';

import { useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import {
  Users, Activity, TrendingUp, AlertTriangle,
  Flame, Trophy, BookOpen, Wifi, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function StatCard({
  icon: Icon, label, value, sub, color = 'sky', trend,
}: {
  icon: any; label: string; value: string | number; sub?: string;
  color?: string; trend?: 'up' | 'down' | 'neutral';
}) {
  const colors: Record<string, string> = {
    sky:     'bg-sky-50 text-sky-600 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    red:     'bg-red-50 text-red-500 border-red-100',
    violet:  'bg-violet-50 text-violet-600 border-violet-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn('h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0', colors[color])}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function TierBar({ distribusi, total }: { distribusi: Record<string, number>; total: number }) {
  const items = [
    { key: 'premium',    label: 'Premium', color: 'bg-violet-500' },
    { key: 'daily_pass', label: 'Daily',   color: 'bg-amber-400' },
    { key: 'free',       label: 'Free',    color: 'bg-slate-300' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-700 mb-4">Distribusi Tier Siswa</p>
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4">
        {items.map(it => {
          const count = distribusi[it.key] ?? 0;
          const pct   = total > 0 ? (count / total) * 100 : 0;
          return pct > 0 ? (
            <div key={it.key} className={cn('h-full transition-all', it.color)} style={{ width: `${pct}%` }} />
          ) : null;
        })}
      </div>
      <div className="flex gap-4">
        {items.map(it => (
          <div key={it.key} className="flex items-center gap-1.5">
            <div className={cn('h-2.5 w-2.5 rounded-full', it.color)} />
            <span className="text-xs text-slate-500">{it.label}</span>
            <span className="text-xs font-bold text-slate-700">{distribusi[it.key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PengamatDashboardPage() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['pengamat-overview'],
    queryFn:  () => pengamatApi.overview(),
    staleTime: 60_000,
  });

  const d = data?.data?.data;

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {d?.sekolah?.nama ?? 'Dashboard Pengamat'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {d?.sekolah?.kota ? `${d.sekolah.kota} · ` : ''}
            Pantau progres siswa dari sekolahmu secara real-time
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isRefetching}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all">
          <RefreshCw className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Alert jika banyak tidak aktif */}
      {(d?.tidak_aktif_7d ?? 0) > 3 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{d.tidak_aktif_7d} siswa</strong> tidak aktif lebih dari 7 hari.
            <a href="/pengamat/at-risk" className="ml-1.5 text-amber-600 font-bold underline">Lihat detail →</a>
          </p>
        </div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total Siswa"       value={d?.total_siswa ?? 0}      color="sky" />
        <StatCard icon={Wifi}       label="Aktif Hari Ini"    value={d?.aktif_hari_ini ?? 0}   color="emerald" sub="siswa belajar hari ini" />
        <StatCard icon={Activity}   label="Sesi Minggu Ini"   value={d?.sesi_minggu_ini ?? 0}  color="violet" sub="total sesi berjalan" />
        <StatCard icon={TrendingUp} label="Avg SNBT Estimasi" value={d?.avg_snbt ?? '–'}       color="sky"    sub="rata-rata seluruh siswa" />
        <StatCard icon={Flame}      label="Streak Konsisten"  value={d?.streak_bagus ?? 0}     color="amber"  sub="streak ≥ 7 hari" />
        <StatCard icon={AlertTriangle} label="Tidak Aktif 7hr" value={d?.tidak_aktif_7d ?? 0} color="red"   sub="perlu perhatian" />
        <StatCard icon={Activity}   label="Aktif Minggu Ini"  value={d?.aktif_minggu_ini ?? 0} color="emerald" sub="unique siswa" />
        <StatCard icon={Trophy}     label="Mapel Aktif"       value="–"                         color="violet" sub="coming soon" />
      </div>

      {/* Tier distribution */}
      {d && (
        <TierBar distribusi={d.tier_distribusi ?? {}} total={d.total_siswa ?? 0} />
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/pengamat/dashboard/ranking',   icon: Trophy,        label: 'Lihat Ranking',   desc: 'Peringkat siswa berdasarkan skor SNBT', color: 'from-violet-500 to-violet-700' },
          { href: '/pengamat/dashboard/kelemahan', icon: BookOpen,       label: 'Kelemahan Kelas', desc: 'Sub-materi yang paling banyak dilemahkan', color: 'from-sky-500 to-sky-700' },
          { href: '/pengamat/dashboard/at-risk',   icon: AlertTriangle, label: 'Siswa Berisiko',  desc: `${d?.tidak_aktif_7d ?? 0} siswa perlu perhatian`, color: 'from-amber-500 to-amber-700' },
        ].map(item => (
          <a key={item.href} href={item.href}
            className={cn('rounded-2xl bg-gradient-to-br p-5 text-white hover:opacity-90 transition-opacity shadow-lg', item.color)}>
            <item.icon className="h-6 w-6 mb-3 opacity-80" />
            <p className="font-bold text-base">{item.label}</p>
            <p className="text-xs opacity-70 mt-1">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
