'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import {
  Upload, FileText, CheckCircle2, XCircle, Sparkles,
  Loader2, ChevronRight, RotateCcw, Clock,
  RefreshCw, ArrowLeft, ArrowRight, Check,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const ACCEPTED = '.pdf,.docx,.txt,.md,.jpg,.jpeg,.png';

// ── Step indicator ────────────────────────────────────────
const STEPS = ['Upload', 'Mapel', 'Sub-Materi', 'Konfigurasi', 'Generate'];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                done   ? 'bg-sky-500 text-white'
                : active ? 'bg-white border-2 border-sky-500 text-sky-600'
                : 'bg-slate-100 text-slate-400',
              )}>
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn('text-[10px] font-medium whitespace-nowrap hidden sm:block',
                active ? 'text-sky-600' : done ? 'text-sky-500' : 'text-slate-400',
              )}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-0.5 flex-1 mx-2 mt-[-14px]"
                style={{ backgroundColor: i < current ? '#0ea5e9' : '#e2e8f0' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Upload File ───────────────────────────────────
function Step1({ file, setFile, onNext }: {
  file: File | null; setFile: (f: File | null) => void; onNext: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, [setFile]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Upload Materi</h2>
        <p className="text-sm text-slate-500 mt-0.5">PDF, DOCX, TXT, gambar — AI akan ekstrak & generate soal</p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !file && fileRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all cursor-pointer',
          drag    ? 'border-sky-400 bg-sky-50 scale-[1.01]'
          : file  ? 'border-emerald-400 bg-emerald-50'
          : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50',
        )}
      >
        <input ref={fileRef} type="file" hidden accept={ACCEPTED}
          onChange={e => setFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <>
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="text-xs text-red-400 hover:underline">Ganti file</button>
          </>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-sky-100 flex items-center justify-center">
              <Upload className="h-7 w-7 text-sky-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-600">
                {drag ? 'Lepaskan di sini...' : 'Klik atau drag file ke sini'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF · DOCX · TXT · JPG · PNG · Maks 20 MB</p>
            </div>
          </>
        )}
      </div>

      <button
        onClick={onNext} disabled={!file}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all',
          file ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed',
        )}>
        Lanjut — Pilih Mapel <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Step 2: Pilih Mapel ───────────────────────────────────
function Step2({ mapelIds, setMapelIds, onNext, onBack }: {
  mapelIds: number[]; setMapelIds: (ids: number[]) => void;
  onNext: () => void; onBack: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-mapel-list'],
    queryFn: () => adminApi.mapelList(),
    staleTime: Infinity,
  });
  const mapels: Array<{ id: number; nama: string; kode: string }> = data?.data?.data ?? [];

  const toggle = (id: number) =>
    setMapelIds(mapelIds.includes(id) ? mapelIds.filter(x => x !== id) : [...mapelIds, id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Pilih Mata Pelajaran</h2>
        <p className="text-sm text-slate-500 mt-0.5">AI akan generate soal sesuai mapel yang dipilih</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5,6,7].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-500">{mapelIds.length} dipilih</span>
            <div className="flex gap-3">
              <button onClick={() => setMapelIds(mapels.map(m => m.id))} className="text-sky-500 font-semibold hover:underline">Semua</button>
              <button onClick={() => setMapelIds([])} className="text-slate-400 hover:underline">Reset</button>
            </div>
          </div>
          {mapels.map(m => {
            const active = mapelIds.includes(m.id);
            return (
              <button key={m.id} onClick={() => toggle(m.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150',
                  active ? 'bg-sky-50 border-2 border-sky-400' : 'bg-white border border-slate-200 hover:border-sky-300',
                )}>
                <span className={cn(
                  'shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold min-w-[3rem] text-center',
                  active ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-600',
                )}>{m.kode}</span>
                <span className="flex-1 text-sm font-medium text-slate-700">{m.nama}</span>
                {active && <Check className="h-4 w-4 text-sky-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <button onClick={onNext} disabled={mapelIds.length === 0}
          className={cn('flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all',
            mapelIds.length > 0 ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}>
          Lanjut — Konfigurasi <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 2b: Sub-Materi per Mapel ─────────────────────
function Step2b({ mapelIds, subMap, setSubMap, onNext, onBack }: {
  mapelIds: number[];
  subMap: Record<number, string[]>;
  setSubMap: (m: Record<number, string[]>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { data } = useQuery({ queryKey: ['admin-mapel-list'], queryFn: () => adminApi.mapelList(), staleTime: Infinity });
  const allMapels: Array<{ id: number; nama: string; kode: string }> = data?.data?.data ?? [];
  const chosen = allMapels.filter(m => mapelIds.includes(m.id));
  const [inputs, setInputs] = useState<Record<number, string>>({});

  function addSub(mapelId: number) {
    const val = (inputs[mapelId] ?? '').trim();
    if (!val) return;
    const existing = subMap[mapelId] ?? [];
    if (!existing.includes(val)) {
      setSubMap({ ...subMap, [mapelId]: [...existing, val] });
    }
    setInputs(p => ({ ...p, [mapelId]: '' }));
  }

  function removeSub(mapelId: number, name: string) {
    setSubMap({ ...subMap, [mapelId]: (subMap[mapelId] ?? []).filter(s => s !== name) });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Target Sub-Materi</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Tentukan topik/bab per mapel agar soal dikelompokkan dengan benar.
          <span className="text-sky-500 font-medium"> Bisa dikosongkan</span> — AI akan buat nama otomatis.
        </p>
      </div>

      <div className="space-y-4">
        {chosen.map(m => {
          const subs = subMap[m.id] ?? [];
          return (
            <div key={m.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-lg px-2.5 py-1 text-xs font-bold bg-sky-100 text-sky-700">{m.kode}</span>
                <span className="text-sm font-semibold text-slate-700">{m.nama}</span>
              </div>

              {/* Tag chips */}
              {subs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {subs.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-1 text-xs font-medium text-sky-700">
                      {s}
                      <button onClick={() => removeSub(m.id, s)} className="ml-0.5 text-sky-400 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <input
                  value={inputs[m.id] ?? ''}
                  onChange={e => setInputs(p => ({ ...p, [m.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub(m.id); }}}
                  placeholder="Nama sub-materi, tekan Enter"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
                />
                <button onClick={() => addSub(m.id)}
                  className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-white hover:bg-sky-600 transition-all">
                  + Tambah
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-2">
        <span className="text-amber-500 text-sm shrink-0">⚠️</span>
        <p className="text-xs text-amber-700">
          Sub-materi yang kamu tambahkan akan langsung tersedia di halaman <strong>Latihan Per Bab</strong> setelah soal di-approve.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <button onClick={onNext} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 py-3 text-sm font-bold text-white transition-all">
          Lanjut — Konfigurasi <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Konfigurasi ────────────────────────────────────
function Step3({ jumlah, setJumlah, tingkat, setTingkat, onNext, onBack }: {
  jumlah: number; setJumlah: (n: number) => void;
  tingkat: string; setTingkat: (t: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const presets = [5, 10, 20, 30, 50];
  const levels  = [
    { id: 'mudah',  label: 'Mudah',  desc: 'Soal dasar, cocok untuk pemula', color: 'emerald' },
    { id: 'sedang', label: 'Sedang', desc: 'Standar SNBT, recommended',       color: 'sky' },
    { id: 'sulit',  label: 'Sulit',  desc: 'Tingkat tinggi, untuk latihan intensif', color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Konfigurasi Generate</h2>
        <p className="text-sm text-slate-500 mt-0.5">Atur jumlah dan tingkat kesulitan soal</p>
      </div>

      {/* Jumlah soal */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Jumlah Soal Target</p>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setJumlah(Math.max(5, jumlah - 5))}
            className="h-10 w-10 rounded-xl border border-slate-200 text-xl font-bold text-slate-600 hover:border-sky-400 transition-all flex items-center justify-center">−</button>
          <div className="flex-1 text-center">
            <p className="text-4xl font-black text-sky-600">{jumlah}</p>
            <p className="text-xs text-slate-400">soal</p>
          </div>
          <button onClick={() => setJumlah(Math.min(50, jumlah + 5))}
            className="h-10 w-10 rounded-xl border border-slate-200 text-xl font-bold text-slate-600 hover:border-sky-400 transition-all flex items-center justify-center">+</button>
        </div>
        <div className="flex gap-2">
          {presets.map(n => (
            <button key={n} onClick={() => setJumlah(n)}
              className={cn('flex-1 rounded-lg py-1.5 text-xs font-bold transition-all',
                jumlah === n ? 'bg-sky-500 text-white' : 'border border-slate-200 text-slate-500 hover:border-sky-300')}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Tingkat kesulitan */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Tingkat Kesulitan</p>
        <div className="space-y-2">
          {levels.map(l => {
            const active = tingkat === l.id;
            const colors: Record<string, string> = {
              emerald: active ? 'border-2 border-emerald-400 bg-emerald-50' : 'border border-slate-200 hover:border-emerald-300',
              sky:     active ? 'border-2 border-sky-400 bg-sky-50'         : 'border border-slate-200 hover:border-sky-300',
              amber:   active ? 'border-2 border-amber-400 bg-amber-50'     : 'border border-slate-200 hover:border-amber-300',
            };
            const dotColors: Record<string, string> = { emerald: 'bg-emerald-400', sky: 'bg-sky-400', amber: 'bg-amber-400' };
            return (
              <button key={l.id} onClick={() => setTingkat(l.id)}
                className={cn('w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all', colors[l.color])}>
                <div className={cn('h-3 w-3 rounded-full shrink-0', dotColors[l.color])} />
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

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <button onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 py-3 text-sm font-bold text-white transition-all">
          Lanjut — Review <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Review & Generate ──────────────────────────────
function Step4({ file, mapelIds, subMap, jumlah, tingkat, onBack, onSuccess }: {
  file: File; mapelIds: number[]; subMap: Record<number, string[]>;
  jumlah: number; tingkat: string;
  onBack: () => void; onSuccess: () => void;
}) {
  const { data } = useQuery({ queryKey: ['admin-mapel-list'], queryFn: () => adminApi.mapelList(), staleTime: Infinity });
  const allMapels: Array<{ id: number; nama: string; kode: string }> = data?.data?.data ?? [];
  const chosen = allMapels.filter(m => mapelIds.includes(m.id));
  const totalSubMateri = Object.values(subMap).flat().length;

  const mut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target_mapel_ids', JSON.stringify(mapelIds));
      fd.append('jumlah_soal_target', String(jumlah));
      fd.append('tingkat_kesulitan', tingkat);
      // Only send if admin specified at least one sub-materi
      if (Object.keys(subMap).length > 0) {
        fd.append('target_sub_materi', JSON.stringify(subMap));
      }
      return adminApi.aiUpload(fd);
    },
    onSuccess: (res) => {
      toast.success(`"${res.data?.data?.filename ?? file.name}" berhasil! AI sedang generate soal...`);
      onSuccess();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Upload gagal.'),
  });

  const rows = [
    { label: 'File',          value: file.name,                                      sub: `${(file.size/1024).toFixed(1)} KB` },
    { label: 'Mapel',         value: chosen.map(m => m.kode).join(', ') || '—',       sub: `${chosen.length} mata pelajaran` },
    { label: 'Sub-Materi',    value: totalSubMateri > 0 ? `${totalSubMateri} topik`  : 'Auto (AI)', sub: totalSubMateri > 0 ? 'Ditentukan admin' : 'AI generate otomatis' },
    { label: 'Jumlah Soal',   value: `${jumlah} soal`,                               sub: 'target generate' },
    { label: 'Kesulitan',     value: tingkat.charAt(0).toUpperCase()+tingkat.slice(1), sub: 'tingkat soal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Review & Generate</h2>
        <p className="text-sm text-slate-500 mt-0.5">Pastikan semua konfigurasi sudah benar</p>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        {rows.map((r, i) => (
          <div key={i} className={cn('flex items-center justify-between px-5 py-3.5', i > 0 && 'border-t border-slate-100')}>
            <span className="text-sm text-slate-500">{r.label}</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{r.value}</p>
              <p className="text-xs text-slate-400">{r.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-materi detail */}
      {totalSubMateri > 0 && (
        <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-xs font-bold text-sky-700 mb-2">Sub-Materi yang akan dibuat:</p>
          <div className="space-y-1.5">
            {chosen.map(m => {
              const subs = subMap[m.id] ?? [];
              if (subs.length === 0) return null;
              return (
                <div key={m.id} className="flex items-start gap-2">
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-sky-200 text-sky-800 shrink-0 mt-0.5">{m.kode}</span>
                  <p className="text-xs text-sky-700">{subs.join(' · ')}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 flex gap-3">
        <Sparkles className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
        <p className="text-xs text-sky-700">AI akan membaca dokumen lalu membuat soal SNBT sesuai sub-materi yang ditentukan. Proses berlangsung di background — soal muncul di bank setelah admin approve di halaman Review Soal AI.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={mut.isPending}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <button onClick={() => mut.mutate()} disabled={mut.isPending}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 py-3 text-sm font-bold text-white transition-all disabled:opacity-70">
          {mut.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
            : <><Sparkles className="h-4 w-4" /> Generate Soal AI</>}
        </button>
      </div>
    </div>
  );
}

// ── History row ────────────────────────────────────────────
function HistRow({ u, onDone }: { u: any; onDone: () => void }) {
  const [status, setStatus] = useState(u.status);
  const [drafts, setDrafts] = useState<number | null>(u.drafts_count ?? null);

  const retryMut = useMutation({
    mutationFn: () => adminApi.retryUpload(u.id),
    onSuccess: () => { toast.success('Dijadwalkan ulang!'); setStatus('processing'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal.'),
  });

  const icon = status === 'done' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    : status === 'failed' ? <XCircle className="h-5 w-5 text-red-400" />
    : <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />;

  const bg = status === 'done' ? 'bg-emerald-50' : status === 'failed' ? 'bg-red-50' : 'bg-sky-50';

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', bg)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{u.filename}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {u.jumlah_soal_target} soal · {formatDate(u.created_at)}
          {drafts !== null && status === 'done' && <span className="ml-2 text-emerald-600 font-medium">· {drafts} draft</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {status === 'done' && (
          <Link href={ROUTES.admin.aiDrafts}>
            <button className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1">
              Review <ChevronRight className="h-3 w-3" />
            </button>
          </Link>
        )}
        {status === 'failed' && (
          <button onClick={() => retryMut.mutate()} disabled={retryMut.isPending}
            className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:underline disabled:opacity-50">
            <RotateCcw className="h-3 w-3" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function AdminAiUploadPage() {
  const qc = useQueryClient();
  const [step, setStep]         = useState(0);
  const [file, setFile]         = useState<File | null>(null);
  const [mapelIds, setMapelIds] = useState<number[]>([]);
  const [subMap, setSubMap]     = useState<Record<number, string[]>>({});
  const [jumlah, setJumlah]     = useState(20);
  const [tingkat, setTingkat]   = useState('sedang');

  const { data: histData, isLoading: histLoading, refetch } = useQuery({
    queryKey: ['upload-history'],
    queryFn: () => adminApi.uploadHistory(),
    staleTime: 30_000,
  });
  const history: any[] = histData?.data?.data?.data ?? [];

  function reset() {
    setStep(0); setFile(null); setMapelIds([]); setSubMap({});
    setJumlah(20); setTingkat('sedang');
    qc.invalidateQueries({ queryKey: ['upload-history'] });
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-sky-500" /> Generate Soal AI
        </h1>
        <p className="text-sm text-slate-500 mt-1">Upload materi → pilih mapel → generate soal SNBT otomatis</p>
      </div>

      {/* Pipeline flow banner */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
        <p className="text-xs font-bold text-sky-700 mb-3 uppercase tracking-wide">Alur Generate Soal</p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { n: '1', label: 'Upload Materi' },
            { n: '2', label: 'AI Generate Draft' },
            { n: '3', label: 'Admin Approve ⬅ wajib' },
            { n: '4', label: 'Soal Live di Platform' },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 2 ? 'bg-amber-400 text-white' : 'bg-sky-200 text-sky-800'}`}>{s.n}</span>
                <span className={`text-xs font-medium ${i === 2 ? 'text-amber-700 font-bold' : 'text-sky-700'}`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <span className="text-sky-300 text-xs">→</span>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-sky-600">Setelah generate selesai, soal perlu di-review di:</span>
          <Link href={ROUTES.admin.aiDrafts}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1 text-xs font-bold text-white hover:bg-sky-600 transition-all">
            Review &amp; Approve Soal <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Wizard card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <StepBar current={step} />
        {step === 0 && <Step1 file={file} setFile={setFile} onNext={() => setStep(1)} />}
        {step === 1 && <Step2 mapelIds={mapelIds} setMapelIds={setMapelIds} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step2b mapelIds={mapelIds} subMap={subMap} setSubMap={setSubMap} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3 jumlah={jumlah} setJumlah={setJumlah} tingkat={tingkat} setTingkat={setTingkat} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && file && <Step4 file={file} mapelIds={mapelIds} subMap={subMap} jumlah={jumlah} tingkat={tingkat} onBack={() => setStep(3)} onSuccess={reset} />}
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" /> Riwayat Upload
          </h2>
          <button onClick={() => refetch()} disabled={histLoading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors">
            <RefreshCw className={cn('h-3.5 w-3.5', histLoading && 'animate-spin')} /> Refresh
          </button>
        </div>
        {histLoading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Belum ada upload. Mulai generate soal di atas!</p>
          </div>
        ) : (
          <div>{history.map((u: any) => <HistRow key={u.id} u={u} onDone={() => refetch()} />)}</div>
        )}
      </div>
    </div>
  );
}
