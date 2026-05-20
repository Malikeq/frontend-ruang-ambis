'use client';

import { useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flame, Target, BookOpen, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SiswaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['pengamat-siswa-detail', id],
    queryFn:  () => pengamatApi.siswaDetail(Number(id)),
  });
  const d = data?.data?.data;

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-xl" />
      <div className="h-32 bg-slate-100 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!d) return <div className="text-center text-slate-400 py-20">Data tidak ditemukan</div>;

  const { siswa, sesi_list, progres_mapel, kelemahan } = d;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5 shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white text-2xl font-black shrink-0">
          {siswa.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-800">{siswa.name}</h1>
          <p className="text-sm text-slate-400">{siswa.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1">
              <Flame className="h-3 w-3" /> {siswa.streak_days} streak
            </span>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
              {siswa.tier}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-emerald-600">
            {progres_mapel?.length > 0
              ? Math.round(progres_mapel.reduce((a: number, m: any) => a + parseFloat(m.akurasi), 0) / progres_mapel.length)
              : '–'}
            {progres_mapel?.length > 0 ? '%' : ''}
          </p>
          <p className="text-xs text-slate-400">Rata-rata akurasi</p>
        </div>
      </div>

      {/* Target kampus */}
      {siswa.kampus_targets?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" /> Target Kampus
          </p>
          <div className="space-y-2">
            {siswa.kampus_targets.slice(0, 3).map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="text-xs font-bold text-slate-400 w-4">{t.priority}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.kampus?.nama}</p>
                  <p className="text-xs text-slate-400">{t.jurusan?.nama}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progres per mapel */}
      {progres_mapel?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-sky-500" /> Progres per Mapel
          </p>
          <div className="space-y-3">
            {progres_mapel.map((m: any) => (
              <div key={m.kode}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">{m.mapel}</span>
                  <span className={cn('text-xs font-black', parseFloat(m.akurasi) >= 70 ? 'text-emerald-600' : parseFloat(m.akurasi) >= 50 ? 'text-amber-600' : 'text-red-500')}>
                    {m.akurasi}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', parseFloat(m.akurasi) >= 70 ? 'bg-emerald-500' : parseFloat(m.akurasi) >= 50 ? 'bg-amber-400' : 'bg-red-400')}
                    style={{ width: `${m.akurasi}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{m.total} soal dikerjakan</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kelemahan */}
      {kelemahan?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-3">⚠️ Kelemahan Utama</p>
          <div className="space-y-2">
            {kelemahan.map((k: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{k.sub_materi}</p>
                  <p className="text-xs text-slate-400">{k.mapel}</p>
                </div>
                <span className="text-sm font-black text-red-500">{k.accuracy_rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat sesi */}
      {sesi_list?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-500" /> Riwayat Sesi (30 Hari)
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sesi_list.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50">
                <div>
                  <p className="text-xs font-semibold text-slate-700 capitalize">{s.tipe}</p>
                  <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                </div>
                {s.skor_akhir && (
                  <span className="text-sm font-black text-emerald-600">{Math.round(s.skor_akhir)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
