'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAY_OPTIONS = [
  { value: 7,  label: '7 Hari' },
  { value: 14, label: '14 Hari' },
  { value: 30, label: '30 Hari' },
];

export default function PengamatAktivitasPage() {
  const [hari, setHari] = useState(7);

  const { data, isLoading } = useQuery({
    queryKey: ['pengamat-aktivitas', hari],
    queryFn:  () => pengamatApi.aktivitasHarian(hari),
    staleTime: 60_000,
  });
  const rows: any[] = data?.data?.data ?? [];

  const maxSesi    = Math.max(...rows.map((r: any) => r.total_sesi), 1);
  const maxAktif   = Math.max(...rows.map((r: any) => r.siswa_aktif), 1);
  const totalSesi  = rows.reduce((a: number, r: any) => a + r.total_sesi, 0);
  const totalAktif = rows.reduce((a: number, r: any) => a + r.siswa_aktif, 0);

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-sky-500" /> Aktivitas Harian
          </h1>
          <p className="text-sm text-slate-500 mt-1">Grafik latihan siswa dari hari ke hari</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
          {DAY_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setHari(o.value)}
              className={cn('px-3 py-2 text-xs font-semibold transition-all',
                hari === o.value ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-50')}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sesi', value: totalSesi, color: 'text-sky-600' },
          { label: 'Siswa Aktif (Unik)', value: totalAktif, color: 'text-emerald-600' },
          { label: 'Rata-rata Sesi/Hari', value: rows.length > 0 ? (totalSesi / rows.length).toFixed(1) : 0, color: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart — Sesi */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-700 mb-4">Total Sesi per Hari</p>
        {isLoading ? (
          <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
        ) : (
          <div className="flex items-end gap-1.5 h-48">
            {rows.map((r: any) => {
              const pct = maxSesi > 0 ? (r.total_sesi / maxSesi) * 100 : 0;
              return (
                <div key={r.tanggal} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    {r.total_sesi > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {r.total_sesi}
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-lg bg-sky-500 transition-all hover:bg-sky-400"
                      style={{ height: `${Math.max(pct * 1.6, r.total_sesi > 0 ? 4 : 0)}px` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 text-center leading-tight" style={{ writingMode: hari > 14 ? 'vertical-rl' : 'horizontal-tb' }}>
                    {fmtDate(r.tanggal)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart — Siswa Aktif */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-700 mb-4">Siswa Aktif per Hari</p>
        {isLoading ? (
          <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
        ) : (
          <div className="flex items-end gap-1.5 h-48">
            {rows.map((r: any) => {
              const pct = maxAktif > 0 ? (r.siswa_aktif / maxAktif) * 100 : 0;
              return (
                <div key={r.tanggal} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    {r.siswa_aktif > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {r.siswa_aktif}
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-400"
                      style={{ height: `${Math.max(pct * 1.6, r.siswa_aktif > 0 ? 4 : 0)}px` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 text-center leading-tight">
                    {fmtDate(r.tanggal)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400">Tanggal</th>
              <th className="text-center px-3 py-3 text-xs font-bold text-slate-400">Total Sesi</th>
              <th className="text-center px-3 py-3 text-xs font-bold text-slate-400">Siswa Aktif</th>
              <th className="text-center px-3 py-3 text-xs font-bold text-slate-400">Avg SNBT</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice().reverse().map((r: any) => (
              <tr key={r.tanggal} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-2.5 text-sm font-medium text-slate-700">{fmtDate(r.tanggal)}</td>
                <td className="px-3 py-2.5 text-center text-sm font-bold text-sky-600">{r.total_sesi}</td>
                <td className="px-3 py-2.5 text-center text-sm font-bold text-emerald-600">{r.siswa_aktif}</td>
                <td className="px-3 py-2.5 text-center text-sm font-bold text-slate-700">{r.avg_snbt > 0 ? r.avg_snbt : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
