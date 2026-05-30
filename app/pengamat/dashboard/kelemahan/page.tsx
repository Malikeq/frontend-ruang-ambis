'use client';

import { useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import { AlertTriangle, Activity, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface KelemahanItem {
  sub_materi_id: number;
  sub_materi: string;
  mapel: string;
  kode_mapel: string;
  jumlah_siswa: number;
  avg_akurasi: number;
  total_attempt: number;
  persen_siswa: number;
}

const MAPEL_COLORS: Record<string, string> = {
  TPS: 'bg-violet-100 text-violet-700 border-violet-200',
  TKA: 'bg-sky-100 text-sky-700 border-sky-200',
  'Mat Dasar': 'bg-amber-100 text-amber-700 border-amber-200',
  default: 'bg-slate-100 text-slate-600 border-slate-200',
};

function AkurasiBar({ value }: { value: number }) {
  const color =
    value < 40 ? 'bg-red-500'
    : value < 60 ? 'bg-amber-400'
    : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn('text-xs font-black w-9 text-right',
        value < 40 ? 'text-red-500' : value < 60 ? 'text-amber-500' : 'text-emerald-600')}>
        {Math.round(value)}%
      </span>
    </div>
  );
}

export default function KelemahanKelasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pengamat-kelemahan'],
    queryFn:  () => pengamatApi.kelemahanKelas(),
    staleTime: 120_000,
  });

  const items: KelemahanItem[] = data?.data?.data ?? [];
  const totalSiswa: number = data?.data?.total_siswa ?? 0;

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-52 bg-slate-200 rounded-xl" />
      {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Kelemahan Kelas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sub-materi dengan akurasi terendah di kelasmu · {totalSiswa} siswa
          </p>
        </div>
        <Link href="/pengamat/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-all">
          ← Dashboard
        </Link>
      </div>

      {/* Summary alert */}
      {items.length > 0 && items[0].avg_akurasi < 40 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{items.filter(i => i.avg_akurasi < 40).length} sub-materi</strong> memiliki akurasi di bawah 40%.
            Pertimbangkan untuk fokus di area ini.
          </p>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">Belum ada data kelemahan</p>
          <p className="text-sm mt-1">Siswa perlu menyelesaikan lebih banyak latihan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const mapelColor = MAPEL_COLORS[item.kode_mapel] ?? MAPEL_COLORS.default;
            return (
              <div key={item.sub_materi_id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5',
                    idx < 3 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                  )}>
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-slate-800 text-sm truncate">{item.sub_materi}</p>
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', mapelColor)}>
                        {item.mapel}
                      </span>
                    </div>

                    <AkurasiBar value={item.avg_akurasi} />

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users className="h-3 w-3" />
                        <span>{item.jumlah_siswa} siswa</span>
                        <span className="text-slate-300">·</span>
                        <span>{Math.round(item.persen_siswa)}% dari kelas</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.total_attempt} percobaan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
