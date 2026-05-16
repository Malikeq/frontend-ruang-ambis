'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { latihanApi, aiApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { MAPEL_LIST } from '@/lib/constants';
import { cn, getMapelColor, getDifficultyColor } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  BookOpen, ChevronRight, CheckCircle2,
  XCircle, Trophy, RotateCcw, Sparkles, AlertTriangle, Timer,
  Brain, Send, Lock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Suspense } from 'react';

// ── Types ─────────────────────────────────────────────────
interface Pilihan { id: number; label: string; konten: string; is_correct?: boolean }
interface SoalData {
  id: number; konten: string; tipe: string; tingkat_kesulitan: string;
  is_ai_generated: boolean;
  mapel: { id: number; nama: string; kode: string };
  sub_materi: { id: number; nama: string };
  pilihan_jawaban: Pilihan[];
  pembahasan?: string | null;
  has_ai_explanation?: boolean;
}
interface AnswerResult { is_correct: boolean; correct_id: number; pilihan_jawaban: Pilihan[] }
type Phase = 'setup' | 'loading' | 'soal' | 'result';

// ── AI Panel (shown after answering) ──────────────────────
function AiPanel({ soal }: { soal: SoalData }) {
  const { user } = useAuthStore();
  const isPremium = user?.tier === 'premium' || user?.tier === 'daily_pass';
  // If pre-cached, auto-show analysis immediately on mount
  const [showAnalysis, setShowAnalysis] = useState(!!soal.has_ai_explanation);
  const [tanyaOpen, setTanyaOpen]       = useState(false);
  const [pertanyaan, setPertanyaan]     = useState('');
  const [jawaban, setJawaban]           = useState<string | null>(null);
  const [quotaError, setQuotaError]     = useState<string | null>(null);

  const { data: analysisData, isLoading: loadingAnalysis, refetch: fetchAnalysis } = useQuery({
    queryKey: ['ai-explanation', soal.id],
    queryFn: () => aiApi.getExplanation(soal.id),
    // Auto-enable fetch if explanation is pre-cached — no button click needed
    enabled: showAnalysis,
    staleTime: Infinity,
  });

  const tanyaMut = useMutation({
    mutationFn: (q: string) => aiApi.tanya({ soal_id: soal.id, pertanyaan: q }),
    onSuccess: (res) => setJawaban(res.data?.data?.jawaban ?? ''),
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'AI sedang sibuk.';
      setQuotaError(msg);
      toast.error(msg);
    },
  });

  const analysis = analysisData?.data?.data;

  async function handleLoadAnalysis() {
    setShowAnalysis(true);
    // query auto-runs because enabled becomes true; refetch for on-demand case
    try {
      await fetchAnalysis();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal memuat analisis AI.';
      setQuotaError(msg);
    }
  }

  return (
    <div className="space-y-3 mt-3">
      {quotaError && (
        <div className="rounded-xl border px-4 py-3 text-xs text-amber-500" style={{ borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.06)' }}>
          ⚠️ {quotaError}
        </div>
      )}
      {/* Static pembahasan */}
      {soal.pembahasan && (
        <div className="rounded-xl p-4" style={{ border: '1px solid var(--primary-border)', backgroundColor: 'var(--primary-muted)' }}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--primary)' }}>📖 Pembahasan</p>
          <p className="text-sm t-secondary leading-relaxed whitespace-pre-line">{soal.pembahasan}</p>
        </div>
      )}

      {/* AI Analysis (DCSEF) — auto-shown for cached soal, button for on-demand */}
      {!showAnalysis ? (
        <Button variant="secondary" size="sm" className="w-full" onClick={handleLoadAnalysis}>
          <Brain className="h-4 w-4" />
          Generate Analisis AI (DCSEF)
        </Button>
      ) : loadingAnalysis ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
            <Sparkles className="h-4 w-4 animate-pulse" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Memuat Analisis AI…</span>
          </div>
          <div className="p-4 space-y-2.5">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className={`h-3 ${i % 2 === 0 ? 'w-full' : 'w-2/3'}`} />)}
          </div>
        </div>
      ) : analysis ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--primary-border)', backgroundColor: 'var(--bg-card)' }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--primary-muted)', borderBottom: '1px solid var(--primary-border)' }}>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Analisis AI — DSCEF</p>
              <span className="text-[10px] t-muted">· {analysis.classifier?.sub_materi}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {analysis.from_cache && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>✓ Cached</span>
              )}
              {analysis.classifier?.estimasi_kesulitan && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize t-muted" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  {analysis.classifier.estimasi_kesulitan}
                </span>
              )}
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>

            {/* S — Stem */}
            {analysis.dekonstruksi && (
              <div className="px-4 py-3.5 space-y-2">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  <span className="flex h-4 w-4 items-center justify-center rounded text-white text-[9px] font-black" style={{ backgroundColor: 'var(--primary)' }}>S</span>
                  Stem — Apa yang Ditanya
                </p>
                <p className="text-sm t-secondary leading-relaxed">
                  <span className="font-semibold t-primary">Ditanya: </span>{analysis.dekonstruksi.ditanya}
                </p>
                {analysis.dekonstruksi.diketahui?.length > 0 && (
                  <ul className="space-y-1 pl-1">
                    {analysis.dekonstruksi.diketahui.map((d: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm t-muted">
                        <span className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}>–</span>{d}
                      </li>
                    ))}
                  </ul>
                )}
                {analysis.dekonstruksi.kata_kunci?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {analysis.dekonstruksi.kata_kunci.map((k: string, i: number) => (
                      <span key={i} className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* D — Distractor */}
            {analysis.dekonstruksi?.jebakan?.length > 0 && (
              <div className="px-4 py-3.5 space-y-2">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  <span className="flex h-4 w-4 items-center justify-center rounded text-white text-[9px] font-black" style={{ backgroundColor: 'var(--primary)' }}>D</span>
                  Distractor — Jebakan Soal
                </p>
                <ul className="space-y-1.5">
                  {analysis.dekonstruksi.jebakan.map((j: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm t-secondary leading-relaxed">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 t-muted" />
                      {j}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* C — Context */}
            {analysis.strategi && (
              <div className="px-4 py-3.5 space-y-2">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  <span className="flex h-4 w-4 items-center justify-center rounded text-white text-[9px] font-black" style={{ backgroundColor: 'var(--primary)' }}>C</span>
                  Context — Konsep &amp; Strategi
                </p>
                <p className="text-sm t-secondary"><span className="font-semibold t-primary">Konsep: </span>{analysis.strategi.konsep_utama}</p>
                {analysis.strategi.rumus && analysis.strategi.rumus !== '-' && (
                  <p className="text-sm t-secondary">
                    <span className="font-semibold t-primary">Rumus: </span>
                    <code className="rounded px-1 py-0.5 text-xs font-mono" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>{analysis.strategi.rumus}</code>
                  </p>
                )}
                {analysis.strategi.kapan_pakai && (
                  <p className="text-sm t-muted"><span className="font-semibold t-secondary">Kapan pakai: </span>{analysis.strategi.kapan_pakai}</p>
                )}
                {analysis.strategi.bedakan_dengan && (
                  <p className="text-sm t-muted"><span className="font-semibold t-secondary">Bedakan dengan: </span>{analysis.strategi.bedakan_dengan}</p>
                )}
                {analysis.strategi.tips_cepat && (
                  <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--primary-muted)', border: '1px solid var(--primary-border)' }}>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <span className="t-secondary leading-relaxed">{analysis.strategi.tips_cepat}</span>
                  </div>
                )}
              </div>
            )}

            {/* E — Execution */}
            {analysis.eksekusi?.langkah?.length > 0 && (
              <div className="px-4 py-3.5 space-y-2">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  <span className="flex h-4 w-4 items-center justify-center rounded text-white text-[9px] font-black" style={{ backgroundColor: 'var(--primary)' }}>E</span>
                  Execution — Langkah Pengerjaan
                </p>
                <ol className="space-y-2">
                  {analysis.eksekusi.langkah.map((l: { no: number; aksi: string; hasil: string }, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>{l.no}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm t-secondary leading-relaxed">{l.aksi}</p>
                        {l.hasil && <p className="text-xs mt-0.5 t-muted font-medium font-mono">→ {l.hasil}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* F — Framework / Output */}
            {analysis.output && (
              <div className="px-4 py-3.5 space-y-2">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  <span className="flex h-4 w-4 items-center justify-center rounded text-white text-[9px] font-black" style={{ backgroundColor: 'var(--primary)' }}>F</span>
                  Framework — Jawaban Final
                </p>
                <div className="rounded-xl p-3.5 space-y-2" style={{ backgroundColor: 'var(--primary-muted)', border: '1px solid var(--primary-border)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white" style={{ backgroundColor: 'var(--primary)' }}>
                      {analysis.output.opsi_benar}
                    </span>
                    <p className="text-sm font-semibold t-primary leading-snug">{analysis.output.jawaban_akhir}</p>
                  </div>
                  {analysis.output.cara_cepat && (
                    <p className="text-sm t-secondary pt-1.5" style={{ borderTop: '1px solid var(--primary-border)' }}>
                      <span className="font-semibold t-primary">Cara cepat: </span>{analysis.output.cara_cepat}
                    </p>
                  )}
                  <div className="flex items-center gap-1 t-muted">
                    <Timer className="h-3 w-3" />
                    <span className="text-[10px]">Waktu ideal: {analysis.output.waktu_ideal_detik} detik</span>
                  </div>
                </div>
              </div>
            )}

            {/* Weakness tags */}
            {analysis.weakness_tags?.length > 0 && (
              <div className="px-4 py-3 flex items-center gap-2 flex-wrap" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <span className="text-[10px] font-semibold uppercase tracking-wider t-muted shrink-0">Topik:</span>
                {analysis.weakness_tags.map((t: string, i: number) => (
                  <span key={i} className="rounded px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>
      ) : null}
      {/* Tanya AI — premium only */}

      {!isPremium ? (
        <div className="flex items-center gap-2 rounded-xl p-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
          <Lock className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs t-muted">
            <span className="font-semibold text-amber-400">Tanya AI</span> — tersedia untuk Premium & Daily Pass.
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--primary-border)', backgroundColor: 'var(--bg-card)' }}>
          <button
            onClick={() => setTanyaOpen(v => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Tanya AI</span>
            {tanyaOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {tanyaOpen && (
            <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
              {jawaban && (
                <div className="rounded-lg p-3 text-sm t-secondary leading-relaxed whitespace-pre-line" style={{ backgroundColor: 'var(--primary-muted)' }}>
                  {jawaban}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={pertanyaan}
                  onChange={e => setPertanyaan(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && pertanyaan.trim()) { tanyaMut.mutate(pertanyaan); setPertanyaan(''); }}}
                  placeholder="Tanyakan sesuatu tentang soal ini..."
                  className="field-input flex-1"
                />
                <Button
                  variant="gradient" size="sm"
                  onClick={() => { tanyaMut.mutate(pertanyaan); setPertanyaan(''); }}
                  isLoading={tanyaMut.isPending}
                  disabled={!pertanyaan.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Formatters ─────────────────────────────────────────────
function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// ── Toggle pill ───────────────────────────────────────────
function TogglePill({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-xs font-semibold transition-colors"
      style={{ color: on ? 'var(--primary)' : 'var(--text-muted)' }}>
      <div className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
        style={{ backgroundColor: on ? 'var(--primary)' : 'var(--border)' }}>
        <div className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300"
          style={{ left: on ? '1.375rem' : '0.25rem' }} />
      </div>
      {on ? 'Aktif' : 'Mati'}
    </button>
  );
}

// ── Latihan modes ─────────────────────────────────────────
const LATIHAN_MODES = [
  { id: 'acak',      emoji: '🎲', label: 'Acak',             desc: 'Soal random dari mapel dipilih',     tipe: 'harian' },
  { id: 'kelemahan', emoji: '🎯', label: 'Fokus Kelemahan',  desc: 'Soal dari area yang sering salah',   tipe: 'harian' },
  { id: 'per_bab',   emoji: '📚', label: 'Per Bab / Topik',  desc: 'Pilih bab atau sub-materi spesifik', tipe: 'harian' },
  { id: 'tryout',    emoji: '⏱️', label: 'Try Out',          desc: 'Simulasi SNBT dengan countdown',     tipe: 'ujian'  },
] as const;

type StartConfig = {
  tipe: string; mode: string;
  mapelIds?: number[]; subMateriIds?: number[];
  jumlahSoal: number; timerMenit?: number;
};

// ── Setup screen ───────────────────────────────────────────
function SetupScreen({ onStart }: { onStart: (cfg: StartConfig) => void }) {
  const searchParams = useSearchParams();
  type SelMapel = { id: number | null; kode: string; nama: string; colorClass: string };
  const [sel, setSel]                       = useState<SelMapel | null>(null);
  const [mode, setMode]                     = useState<string>('acak');
  const [jumlahSoal, setJumlahSoal]         = useState(20);
  const [timerOn, setTimerOn]               = useState(false);
  const [timerMenit, setTimerMenit]         = useState(30);
  const [subMateriSel, setSubMateriSel]     = useState<number[]>([]);

  // Load real mapel IDs from API (do not rely on MAPEL_LIST array index)
  const { data: mapelIdsRes, isLoading: mapelIdsLoading } = useQuery({
    queryKey: ['mapel-ids'],
    queryFn: () => latihanApi.mapelList(),
    staleTime: Infinity,
  });
  const mapelIdsMap: Record<string, number> = {};
  (mapelIdsRes?.data?.data ?? []).forEach((m: { id: number; kode: string }) => {
    mapelIdsMap[m.kode] = m.id;
  });

  // Resolve the real DB mapel ID for the currently selected mapel.
  // Re-derived on every render so it always uses the latest mapelIdsMap.
  // '🎯' is the special code for "Semua Mapel" (no filter).
  const resolvedSelId: number | null =
    !sel || sel.kode === '🎯' ? null : (mapelIdsMap[sel.kode] ?? null);

  const { data: subMateriRes, isLoading: loadingSub } = useQuery({
    // Key on resolvedSelId so query re-runs when API data arrives
    queryKey: ['sub-materi', resolvedSelId],
    queryFn: () => latihanApi.getSubMateri(resolvedSelId),
    // Only fetch when we have a real DB mapel ID (or explicitly "Semua Mapel")
    enabled: !!sel && mode === 'per_bab' && (resolvedSelId !== null || sel.kode === '🎯'),
    staleTime: 5 * 60 * 1000,
  });
  const subMateriList: { id: number; nama: string; soal_count?: number }[] = subMateriRes?.data?.data ?? [];

  useEffect(() => {
    if (searchParams.get('tipe') === 'ujian') setMode('tryout');
  }, [searchParams]);

  useEffect(() => {
    setTimerOn(mode === 'tryout');
    setSubMateriSel([]);
  }, [mode]);

  function openModal(mapel: SelMapel) {
    setSel(mapel); setMode('acak'); setJumlahSoal(20); setTimerOn(false); setTimerMenit(30); setSubMateriSel([]);
  }

  function toggleSub(id: number) {
    setSubMateriSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleStart() {
    if (!sel) return;

    // Re-resolve mapel ID at start time (latest mapelIdsMap, avoids stale closure bug)
    const finalMapelId: number | null =
      sel.kode === '🎯' ? null : (mapelIdsMap[sel.kode] ?? null);

    // Guard: specific mapel selected but IDs haven't loaded from API yet
    if (sel.kode !== '🎯' && finalMapelId === null) {
      toast.error('Data mapel sedang dimuat, tunggu sebentar lalu coba lagi.');
      return;
    }

    const selMode = LATIHAN_MODES.find(m => m.id === mode)!;
    onStart({
      tipe: selMode.tipe, mode,
      mapelIds:     finalMapelId !== null ? [finalMapelId] : undefined,
      subMateriIds: subMateriSel.length > 0 ? subMateriSel : undefined,
      jumlahSoal,
      timerMenit:   timerOn ? timerMenit : undefined,
    });
    setSel(null);
  }

  const activeMode = LATIHAN_MODES.find(m => m.id === mode)!;

  return (
    <div className="space-y-5">
      <PageHeader title="Pilih Materi" description="Klik mapel yang ingin kamu kerjakan hari ini" />

      {/* All-mapel shortcut */}
      <button
        onClick={() => openModal({ id: null, kode: '🎯', nama: 'Semua Mapel', colorClass: '' })}
        className="w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 bg-white"
        style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-border)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary-muted)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: '#f0f9ff', border: '1px solid rgba(14,165,233,0.15)' }}>🎯</div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: '#0f172a' }}>Semua Mapel</p>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Campuran acak semua mata pelajaran SNBT</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0" style={{ color: '#cbd5e1' }} />
      </button>

      {/* Per-mapel cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Atau pilih per Mapel</p>
          {mapelIdsLoading && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: '#94a3b8' }}>
              <span className="h-3 w-3 animate-spin rounded-full border border-t-transparent" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              Memuat data mapel...
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {MAPEL_LIST.map((m) => {
            // ID is opened from mapelIdsMap at click time; validation happens at handleStart
            return (
              <button key={m.kode}
                onClick={() => openModal({ id: mapelIdsMap[m.kode] ?? null, kode: m.kode, nama: m.nama, colorClass: m.colorClass })}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150 bg-white group"
                style={{ border: '1px solid #e2e8f0', opacity: mapelIdsLoading ? 0.7 : 1 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-border)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary-muted)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}
              >
                <span className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold min-w-[3rem] text-center" style={{ backgroundColor: '#f0f9ff', color: 'var(--primary)', border: '1px solid rgba(14,165,233,0.15)' }}>{m.kode}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium leading-snug" style={{ color: '#334155' }}>{m.nama}</p></div>
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: '#cbd5e1' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom-sheet modal ── */}
      {sel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSel(null); }}>
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl animate-fade-in overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 -12px 50px rgba(0,0,0,0.35)', maxHeight: '92dvh' }}>
            <div className="p-6 space-y-6">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {sel.id !== null
                    ? <span className={cn('rounded-xl px-3 py-2 text-sm font-black', sel.colorClass)}>{sel.kode}</span>
                    : <span className="text-2xl">🎯</span>}
                  <div>
                    <h3 className="font-bold t-primary text-base leading-tight">{sel.nama}</h3>
                    <p className="text-xs t-muted">Atur sesi latihanmu</p>
                  </div>
                </div>
                <button onClick={() => setSel(null)}
                  className="h-8 w-8 rounded-full flex items-center justify-center t-muted text-base transition-colors"
                  style={{ backgroundColor: 'var(--bg-elevated)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--border)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}>✕</button>
              </div>

              {/* ── Mode Latihan ── */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest t-muted mb-3">Mode Latihan</p>
                <div className="grid grid-cols-2 gap-2">
                  {LATIHAN_MODES.map(m => {
                    const active = mode === m.id;
                    const warn = m.id === 'tryout';
                    return (
                      <button key={m.id} onClick={() => setMode(m.id)}
                        className="rounded-2xl p-4 text-left transition-all duration-200"
                        style={active ? {
                          border: `2px solid ${warn ? 'rgb(245,158,11)' : 'var(--primary)'}`,
                          backgroundColor: warn ? 'rgba(245,158,11,0.08)' : 'var(--primary-muted)',
                        } : { border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                        <div className="text-xl mb-1.5">{m.emoji}</div>
                        <p className="text-sm font-bold t-primary">{m.label}</p>
                        <p className="text-[10px] t-muted mt-0.5 leading-snug">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Sub-Materi (Per Bab only) ── */}
              {mode === 'per_bab' && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest t-muted mb-3">
                    Pilih Topik / Bab <span className="normal-case font-normal ml-1">(kosong = semua bab)</span>
                  </p>
                  {/* Show waiting state if mapel IDs haven't resolved yet */}
                  {sel?.kode !== '🎯' && resolvedSelId === null ? (
                    <div className="flex items-center gap-2 t-muted text-sm py-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2"
                        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                      Menunggu data mapel...
                    </div>
                  ) : loadingSub ? (
                    <div className="flex items-center gap-2 t-muted text-sm py-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2"
                        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                      Memuat topik...
                    </div>
                  ) : subMateriList.length === 0 ? (
                    <p className="text-sm t-muted py-2">Tidak ada topik tersedia untuk mapel ini.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                      {subMateriList.map(s => {
                        const active = subMateriSel.includes(s.id);
                        return (
                          <button key={s.id} onClick={() => toggleSub(s.id)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150"
                            style={active ? {
                              border: '1.5px solid var(--primary)', backgroundColor: 'var(--primary-muted)',
                            } : { border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                            <div className="flex-1 text-sm t-primary font-medium">{s.nama}</div>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                              {(s as any).soal_count ?? '?'} soal
                            </span>
                            {active && <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                              style={{ background: 'var(--primary)' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Jumlah Soal — stepper ── */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest t-muted mb-3">Jumlah Soal</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => setJumlahSoal(v => Math.max(5, v - 5))}
                    className="h-11 w-11 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-border)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>−</button>
                  <div className="flex-1 text-center">
                    <p className="text-3xl font-black t-primary">{jumlahSoal}</p>
                    <p className="text-[11px] t-muted">soal</p>
                  </div>
                  <button onClick={() => setJumlahSoal(v => Math.min(50, v + 5))}
                    className="h-11 w-11 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-border)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>+</button>
                </div>
                <div className="flex gap-2 mt-3">
                  {[10, 20, 30, 40, 50].map(n => (
                    <button key={n} onClick={() => setJumlahSoal(n)}
                      className="flex-1 rounded-lg py-1.5 text-xs font-bold transition-all"
                      style={jumlahSoal === n ? {
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none',
                      } : { border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Timer ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest t-muted">Timer Countdown</p>
                  <TogglePill on={timerOn} onClick={() => setTimerOn(v => !v)} />
                </div>
                {timerOn && (
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45, 60, 90, 120].map(m => (
                      <button key={m} onClick={() => setTimerMenit(m)}
                        className="rounded-xl py-2.5 text-sm font-bold transition-all duration-200"
                        style={timerMenit === m ? {
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                          color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(14,165,233,0.25)',
                        } : { border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        {m} mnt
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── CTA ── */}
              <Button variant="gradient" size="lg" className="w-full" onClick={handleStart}>
                <BookOpen className="h-5 w-5" />
                Mulai {activeMode.label} · {jumlahSoal} Soal
                {timerOn && <span className="opacity-80 ml-1">· {timerMenit} mnt</span>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Soal screen ────────────────────────────────────────────
function SoalScreen({
  sesiId, totalSoal, tipe, onFinish,
}: {
  sesiId: number; totalSoal: number; tipe: string; onFinish: (sesiId: number) => void;
}) {
  const [index, setIndex]           = useState(0);
  const [answered, setAnswered]     = useState<Record<number, { jawabanId: number | null; result: AnswerResult }>>({});
  const [elapsed, setElapsed]       = useState(0); // ms
  const [soalStart, setSoalStart]   = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Global timer (for exam mode)
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1000), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const { data: soalRes, isLoading } = useQuery({
    queryKey: ['soal', sesiId, index],
    queryFn: () => latihanApi.getSoal(sesiId, index),
    staleTime: Infinity,
    retry: 1,
  });

  const soal: SoalData | null = soalRes?.data?.data ?? null;
  const currentAnswer = soal ? answered[soal.id] : null;

  const jawabMutation = useMutation({
    mutationFn: (payload: { soal_id: number; jawaban_id: number | null; waktu_ms: number }) =>
      latihanApi.jawab(sesiId, payload),
  });

  async function handlePilih(pilihanId: number) {
    if (!soal || currentAnswer || submitting) return;
    setSubmitting(true);
    try {
      const res = await jawabMutation.mutateAsync({
        soal_id: soal.id,
        jawaban_id: pilihanId,
        waktu_ms: Date.now() - soalStart,
      });
      const result: AnswerResult = res.data.data;
      setAnswered(prev => ({ ...prev, [soal.id]: { jawabanId: pilihanId, result } }));
    } catch {
      toast.error('Gagal menyimpan jawaban.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip() {
    if (!soal || currentAnswer || submitting) return;
    setSubmitting(true);
    try {
      const res = await jawabMutation.mutateAsync({ soal_id: soal.id, jawaban_id: null, waktu_ms: Date.now() - soalStart });
      setAnswered(prev => ({ ...prev, [soal.id]: { jawabanId: null, result: res.data.data } }));
    } catch {} finally { setSubmitting(false); }
  }

  function handleNext() {
    if (index < totalSoal - 1) {
      setIndex(i => i + 1);
      setSoalStart(Date.now());
    } else {
      onFinish(sesiId);
    }
  }

  if (isLoading || !soal) {
    return (
      <Card className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
      </Card>
    );
  }

  const pct = ((index) / totalSoal) * 100;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('rounded px-2 py-0.5 text-xs font-bold', getMapelColor(soal.mapel.kode))}>
            {soal.mapel.kode}
          </span>
          <span className="truncate text-xs t-muted">{soal.sub_materi.nama}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-semibold', getDifficultyColor(soal.tingkat_kesulitan))}>
            {soal.tingkat_kesulitan}
          </span>
          {soal.is_ai_generated && (
            <span className="flex items-center gap-0.5 rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
              <Sparkles className="h-2.5 w-2.5" /> AI
            </span>
          )}
          <span className="flex items-center gap-1 text-xs t-muted">
            <Timer className="h-3.5 w-3.5" />{fmtTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs t-muted">
          <span>Soal {index + 1} dari {totalSoal}</span>
          <span>{Object.keys(answered).length} dijawab</span>
        </div>
        <div className="h-1.5 progress-track">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }} />
        </div>
      </div>

      {/* Soal card — auto-detect wacana format */}
      <Card>
        {soal.konten.startsWith('Bacalah teks berikut!') ? (() => {
          // Split wacana from question: "Bacalah teks berikut! {passage} {question?}"
          const raw = soal.konten.replace('Bacalah teks berikut!', '').trim();
          // Find the last sentence that ends with "?" as the question
          const qMatch = raw.match(/^([\s\S]+?)\s+((?:[A-Z][^!.?]*\?))$/);
          const wacanaText = qMatch ? qMatch[1].trim() : raw;
          const questionText = qMatch ? qMatch[2].trim() : '';
          return (
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>📖 Bacalah teks berikut dengan seksama!</p>
                <p className="text-sm leading-relaxed t-secondary">{wacanaText}</p>
              </div>
              {questionText && (
                <p className="text-sm font-semibold leading-relaxed t-primary">{questionText}</p>
              )}
            </div>
          );
        })() : (
          <p className="text-sm leading-relaxed t-primary">{soal.konten}</p>
        )}
      </Card>


      {/* Pilihan jawaban */}
      <div className="space-y-2">
        {soal.pilihan_jawaban.map((p) => {
          const isSelected = currentAnswer?.jawabanId === p.id;
          const isCorrect  = currentAnswer?.result?.pilihan_jawaban?.find(x => x.id === p.id)?.is_correct;
          const answered_  = !!currentAnswer;

          let btnClass = 'option-btn';
          if (answered_) {
            if (isCorrect) btnClass = 'option-btn option-btn-correct';
            else if (isSelected) btnClass = 'option-btn option-btn-wrong';
            else btnClass = 'option-btn option-btn-dim';
          }

          return (
            <button
              key={p.id}
              onClick={() => handlePilih(p.id)}
              disabled={answered_ || submitting}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-5 text-left transition-all duration-200 disabled:cursor-default',
                btnClass,
              )}
            >
              <span className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold mt-0.5 transition-colors',
                answered_ && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white'
                  : answered_ && isSelected ? 'border-red-500 bg-red-500 text-white'
                  : 'border-theme t-muted',
              )}>
                {answered_ && isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" />
                  : answered_ && isSelected ? <XCircle className="h-3.5 w-3.5" />
                  : p.label}
              </span>
              <span className="text-sm t-secondary leading-relaxed">{p.konten}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback + AI panel */}
      {currentAnswer && (
        <div className="space-y-2">
          <div className={cn(
            'rounded-xl border p-4 text-sm font-medium',
            currentAnswer.result.is_correct
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400',
          )}>
            {currentAnswer.result.is_correct ? '✅ Jawaban benar! +10 poin' : '❌ Kurang tepat — pelajari pembahasannya'}
          </div>
          <AiPanel soal={soal} />
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3">
        {!currentAnswer && (
          <Button variant="ghost" size="md" onClick={handleSkip} disabled={submitting} className="flex-1">
            Lewati
          </Button>
        )}
        {currentAnswer && (
          <Button variant="gradient" size="md" onClick={handleNext} className="flex-1">
            {index < totalSoal - 1 ? (
              <>Soal Berikutnya <ChevronRight className="h-4 w-4" /></>
            ) : (
              <>Selesai & Lihat Hasil <Trophy className="h-4 w-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Result screen ──────────────────────────────────────────
function ResultScreen({ sesiId, onRestart }: { sesiId: number; onRestart: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['hasil', sesiId],
    queryFn: () => latihanApi.hasil(sesiId),
  });

  const h = data?.data?.data;

  if (isLoading) return <Card className="space-y-4 py-8"><Skeleton className="h-32" /></Card>;

  const skor = h?.skor_raw ?? 0;
  const emoji = skor >= 80 ? '🏆' : skor >= 60 ? '😊' : skor >= 40 ? '💪' : '📚';

  return (
    <div className="space-y-6 text-center">
      <div className="text-7xl">{emoji}</div>
      <div>
        <h2 className="text-3xl font-black t-primary">{Math.round(skor)}%</h2>
        <p className="mt-1 t-muted">
          {h?.total_benar ?? 0} benar dari {h?.total_soal ?? 0} soal
        </p>
      </div>

      {/* Per mapel */}
      {h?.per_mapel?.length > 0 && (
        <Card className="text-left">
          <h3 className="mb-3 font-semibold t-primary">Hasil per Mapel</h3>
          <div className="space-y-3">
            {h.per_mapel.map((p: any, i: number) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className={cn('rounded px-1.5 py-0.5 font-bold', getMapelColor(p.mapel?.kode ?? ''))}>{p.mapel?.kode}</span>
                  <span className="t-primary font-bold">{p.akurasi}%</span>
                </div>
                <div className="h-1.5 progress-track">
                  <div
                    className={cn('h-full rounded-full', p.akurasi >= 70 ? 'bg-emerald-500' : p.akurasi >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                    style={{ width: `${p.akurasi}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onRestart} className="flex-1">
          <RotateCcw className="h-4 w-4" /> Latihan Lagi
        </Button>
        <Button variant="gradient" size="lg" onClick={() => window.location.href = '/dashboard'} className="flex-1">
          Ke Dashboard
        </Button>
      </div>
    </div>
  );
}

// ── Empty bank soal ────────────────────────────────────────
function EmptyBankSoal() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="text-6xl">📚</div>
      <h2 className="text-xl font-bold t-primary">Bank Soal Belum Tersedia</h2>
      <p className="text-sm t-muted max-w-sm">
        Admin sedang menyiapkan soal berkualitas melalui AI generator.
        Soal akan segera tersedia — pantau terus!
      </p>
      <div className="rounded-2xl p-4 max-w-sm" style={{ border: '1px solid var(--primary-border)', backgroundColor: 'var(--primary-muted)' }}>
        <div className="flex items-start gap-3 text-left">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold t-primary">Cara kerja bank soal:</p>
            <p className="mt-1 text-xs t-muted">
              Admin mengupload materi → AI generate soal → Admin review → Soal dipublikasi ke platformmu.
            </p>
          </div>
        </div>
      </div>
      <Button variant="secondary" size="md" onClick={() => window.location.href = '/dashboard'}>
        ← Kembali ke Dashboard
      </Button>
    </div>
  );
}

// ── Main Latihan Page ──────────────────────────────────────
function LatihanContent() {
  const [phase, setPhase]     = useState<Phase>('setup');
  const [sesiId, setSesiId]   = useState<number | null>(null);
  const [totalSoal, setTotalSoal] = useState(0);
  const [tipe, setTipe]       = useState('harian');
  const [emptyBank, setEmptyBank] = useState(false);

  type StartConfig = {
    tipe: string;
    mode: string;
    mapelIds?: number[];
    subMateriIds?: number[];
    jumlahSoal: number;
    timerMenit?: number;
  };

  const mulaiMutation = useMutation({
    mutationFn: (cfg: StartConfig) =>
      latihanApi.mulai({
        tipe:            cfg.tipe,
        mode:            cfg.mode,
        mapel_ids:       cfg.mapelIds,
        sub_materi_ids:  cfg.subMateriIds,
        jumlah_soal:     cfg.jumlahSoal,
        timer_menit:     cfg.timerMenit,
      }),
    onSuccess: (res) => {
      const d = res.data.data;
      setSesiId(d.id);
      setTotalSoal(d.total_soal);
      setPhase('soal');
    },
    onError: (err: any) => {
      const msg    = err?.response?.data?.message ?? '';
      const status = err?.response?.status;
      if (msg.includes('kosong') || status === 404) {
        setEmptyBank(true);
      } else if (status === 422) {
        const available = err?.response?.data?.available;
        if (available !== undefined) {
          toast.error(`Bank soal hanya punya ${available} soal. Kurangi jumlah soal atau upload lebih banyak materi.`, { duration: 6000 });
        } else {
          toast.error(msg || 'Jumlah soal tidak mencukupi.');
        }
      } else {
        toast.error(msg || 'Gagal memulai sesi latihan.');
      }
      setPhase('setup');
    },
  });

  const selesaiMutation = useMutation({
    mutationFn: (id: number) => latihanApi.selesai(id),
  });

  async function handleStart(cfg: StartConfig) {
    setTipe(cfg.tipe);
    setPhase('loading');
    setEmptyBank(false);
    mulaiMutation.mutate(cfg);
  }

  async function handleFinish(id: number) {
    try { await selesaiMutation.mutateAsync(id); } catch {}
    setPhase('result');
  }

  function handleRestart() {
    setSesiId(null);
    setTotalSoal(0);
    setEmptyBank(false);
    setPhase('setup');
  }

  if (emptyBank) return <EmptyBankSoal />;

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm t-muted">Menyiapkan soal...</p>
      </div>
    );
  }

  if (phase === 'setup') return <SetupScreen onStart={handleStart} />;
  if (phase === 'soal' && sesiId) return <SoalScreen sesiId={sesiId} totalSoal={totalSoal} tipe={tipe} onFinish={handleFinish} />;
  if (phase === 'result' && sesiId) return <ResultScreen sesiId={sesiId} onRestart={handleRestart} />;

  return null;
}

export default function LatihanPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" /></div>}>
      <LatihanContent />
    </Suspense>
  );
}
