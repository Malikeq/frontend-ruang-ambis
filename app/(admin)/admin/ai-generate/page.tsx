'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import axiosInstance from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Sparkles, Loader2, ChevronRight, Check, Zap,
  BookOpen, Target, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const DIFFICULTY = [
  { id: 'mudah',  label: 'Mudah',  desc: 'Soal dasar, cocok untuk pemula',          color: 'emerald' },
  { id: 'sedang', label: 'Sedang', desc: 'Standar SNBT, paling disarankan',         color: 'sky' },
  { id: 'sulit',  label: 'Sulit',  desc: 'Tingkat tinggi, latihan intensif SNBT',   color: 'amber' },
];

const COUNT_PRESETS = [3, 5, 10, 15, 20];

export default function AdminAiGeneratePage() {
  // Form state
  const [mapelId,    setMapelId]    = useState<number | null>(null);
  const [subId,      setSubId]      = useState<number | null>(null);
  const [jumlah,     setJumlah]     = useState(5);
  const [tingkat,    setTingkat]    = useState('sedang');
  const [topik,      setTopik]      = useState('');
  const [autoPub,    setAutoPub]    = useState(false);

  // Result state
  const [result, setResult] = useState<{
    jumlah: number; mode: string; draft_ids: number[];
    soal_ids: number[]; tokens_used: number; upload_id: number;
  } | null>(null);

  // Fetch mapel list
  const { data: mapelData, isLoading: mapelLoading } = useQuery({
    queryKey: ['admin-mapel-list'],
    queryFn:  () => adminApi.mapelList(),
    staleTime: Infinity,
  });
  const mapels: Array<{ id: number; nama: string; kode: string }> =
    mapelData?.data?.data ?? [];

  // Fetch sub-materi when mapel selected (via sub-materi endpoint with auth)
  const { data: subMateriData } = useQuery({
    queryKey: ['sub-materi-by-mapel', mapelId],
    queryFn:  () => axiosInstance.get('/sub-materi', { params: { mapel_id: mapelId } }),
    enabled: !!mapelId,
    staleTime: 60_000,
  });
  const subMateris: Array<{ id: number; nama: string }> =
    subMateriData?.data?.data ?? [];

  // Generate mutation
  const mut = useMutation({
    mutationFn: () => adminApi.generateSoal({
      mapel_id:          mapelId!,
      sub_materi_id:     subId ?? undefined,
      jumlah_soal:       jumlah,
      tingkat_kesulitan: tingkat,
      topik:             topik.trim() || undefined,
      auto_publish:      autoPub,
    }),
    onSuccess: (res) => {
      const d = res.data;
      setResult(d);
      toast.success(d.message ?? 'Soal berhasil digenerate!');
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? 'Generate gagal. Coba lagi.');
    },
  });

  const canGenerate = !!mapelId && !mut.isPending;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Zap className="h-6 w-6 text-violet-500" />
          Generate Soal Langsung (Gemini AI)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tanpa upload file — Gemini generate soal SNBT langsung dari topik yang kamu pilih.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 flex gap-3">
        <Sparkles className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-violet-700 mb-1">Cara kerja Generate Langsung</p>
          <div className="flex items-center gap-2 flex-wrap text-xs text-violet-600">
            {['Pilih Mapel & Topik', 'Gemini Generate', autoPub ? 'Langsung Publish ⚡' : 'Admin Review Draft', 'Soal Live'].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-1">
                <span className="font-semibold">{s}</span>
                {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-violet-400" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>

        {/* Step 1: Pilih Mapel */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-sky-500" /> Mata Pelajaran
          </p>
          {mapelLoading ? (
            <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mapels.map(m => (
                <button key={m.id} onClick={() => { setMapelId(m.id); setSubId(null); }}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all border',
                    mapelId === m.id
                      ? 'border-2 border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50',
                  )}>
                  <span className={cn(
                    'text-xs font-bold rounded-md px-2 py-0.5 shrink-0',
                    mapelId === m.id ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-700',
                  )}>{m.kode}</span>
                  <span className="text-xs font-medium text-slate-700 line-clamp-1">{m.nama}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Sub-materi (optional) */}
        {mapelId && (
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" /> Sub-Materi
              <span className="text-xs font-normal text-slate-400">(opsional)</span>
            </p>
            <p className="text-xs text-slate-400 mb-3">Kosongkan agar AI generate dari seluruh bab mapel ini</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSubId(null)}
                className={cn('rounded-full px-3 py-1.5 text-xs font-semibold border transition-all',
                  subId === null ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400')}>
                Semua Bab
              </button>
              {subMateris.map(s => (
                <button key={s.id} onClick={() => setSubId(s.id)}
                  className={cn('rounded-full px-3 py-1.5 text-xs font-semibold border transition-all',
                    subId === s.id ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-600 hover:border-emerald-300')}>
                  {s.nama}
                </button>
              ))}
              {subMateris.length === 0 && (
                <span className="text-xs text-slate-400 italic">Belum ada sub-materi untuk mapel ini</span>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Topik hint */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-1">Topik / Konteks Tambahan</p>
          <p className="text-xs text-slate-400 mb-2">Opsional — jelaskan topik spesifik agar soal lebih terarah</p>
          <textarea
            value={topik}
            onChange={e => setTopik(e.target.value)}
            placeholder="Contoh: Soal tentang sistem persamaan linear dua variabel, metode eliminasi dan substitusi..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:border-violet-400 focus:outline-none resize-none transition-all"
          />
        </div>

        {/* Step 4: Jumlah soal */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">Jumlah Soal</p>
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => setJumlah(Math.max(1, jumlah - 1))}
              className="h-9 w-9 rounded-xl border border-slate-200 text-lg font-bold text-slate-600 hover:border-sky-400 transition-all flex items-center justify-center">−</button>
            <div className="flex-1 text-center">
              <p className="text-4xl font-black text-sky-600">{jumlah}</p>
              <p className="text-xs text-slate-400">soal (max 20)</p>
            </div>
            <button onClick={() => setJumlah(Math.min(20, jumlah + 1))}
              className="h-9 w-9 rounded-xl border border-slate-200 text-lg font-bold text-slate-600 hover:border-sky-400 transition-all flex items-center justify-center">+</button>
          </div>
          <div className="flex gap-2">
            {COUNT_PRESETS.map(n => (
              <button key={n} onClick={() => setJumlah(n)}
                className={cn('flex-1 rounded-lg py-1.5 text-xs font-bold transition-all',
                  jumlah === n ? 'bg-sky-500 text-white' : 'border border-slate-200 text-slate-500 hover:border-sky-300')}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Step 5: Kesulitan */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">Tingkat Kesulitan</p>
          <div className="space-y-2">
            {DIFFICULTY.map(l => {
              const active = tingkat === l.id;
              const cls: Record<string, string> = {
                emerald: active ? 'border-2 border-emerald-400 bg-emerald-50' : 'border border-slate-200 hover:border-emerald-300',
                sky:     active ? 'border-2 border-sky-400 bg-sky-50'         : 'border border-slate-200 hover:border-sky-300',
                amber:   active ? 'border-2 border-amber-400 bg-amber-50'     : 'border border-slate-200 hover:border-amber-300',
              };
              const dot: Record<string, string> = { emerald: 'bg-emerald-400', sky: 'bg-sky-400', amber: 'bg-amber-400' };
              return (
                <button key={l.id} onClick={() => setTingkat(l.id)}
                  className={cn('w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all', cls[l.color])}>
                  <div className={cn('h-3 w-3 rounded-full shrink-0', dot[l.color])} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{l.label}</p>
                    <p className="text-xs text-slate-400">{l.desc}</p>
                  </div>
                  {active && <Check className="h-4 w-4 text-slate-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-publish toggle */}
        <div className={cn(
          'rounded-xl border px-4 py-3 flex items-center justify-between cursor-pointer transition-all',
          autoPub ? 'border-amber-300 bg-amber-50' : 'border-slate-200 hover:border-slate-300',
        )} onClick={() => setAutoPub(v => !v)}>
          <div>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Zap className={cn('h-4 w-4', autoPub ? 'text-amber-500' : 'text-slate-400')} />
              Auto Publish
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {autoPub
                ? '⚡ Soal langsung tayang tanpa review'
                : 'Soal masuk draft dulu, perlu di-approve'}
            </p>
          </div>
          <div className={cn(
            'h-6 w-11 rounded-full relative transition-colors',
            autoPub ? 'bg-amber-400' : 'bg-slate-200',
          )}>
            <div className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              autoPub ? 'translate-x-5' : 'translate-x-0.5',
            )} />
          </div>
        </div>

        {autoPub && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Perhatian:</strong> Soal akan langsung tersedia untuk siswa tanpa review manual.
              Pastikan kamu mempercayai output Gemini untuk topik ini.
            </p>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={() => { setResult(null); mut.mutate(); }}
          disabled={!canGenerate}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all',
            canGenerate
              ? 'bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 shadow-lg shadow-violet-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          )}>
          {mut.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Gemini sedang generate...</>
            : <><Sparkles className="h-4 w-4" /> Generate {jumlah} Soal dengan Gemini</>
          }
        </button>
      </div>

      {/* Result card */}
      {result && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-4" style={{ boxShadow: '0 1px 8px rgba(16,185,129,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800">
                {result.jumlah} soal berhasil {result.mode === 'published' ? 'dipublikasikan! ⚡' : 'disimpan sebagai draft!'}
              </p>
              <p className="text-xs text-slate-400">{result.tokens_used.toLocaleString()} tokens Gemini digunakan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {result.mode === 'draft' && (
              <Link href={ROUTES.admin.aiDrafts}>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 py-2.5 text-sm font-bold text-white transition-all">
                  Review Draft <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            )}
            {result.mode === 'published' && (
              <Link href={ROUTES.admin.soal ?? '/admin/soal'}>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-2.5 text-sm font-bold text-white transition-all">
                  Lihat Soal <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            )}
            <button onClick={() => { setResult(null); setTopik(''); }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Generate Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
