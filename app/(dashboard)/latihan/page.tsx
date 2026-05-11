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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [tanyaOpen, setTanyaOpen]       = useState(false);
  const [pertanyaan, setPertanyaan]     = useState('');
  const [jawaban, setJawaban]           = useState<string | null>(null);
  const [quotaError, setQuotaError]     = useState<string | null>(null);

  const { data: analysisData, isLoading: loadingAnalysis, refetch: fetchAnalysis } = useQuery({
    queryKey: ['ai-explanation', soal.id],
    queryFn: () => aiApi.getExplanation(soal.id),
    enabled: false,
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

      {/* AI Analysis (DCSEF) */}
      {!showAnalysis ? (
        <Button variant="secondary" size="sm" className="w-full" onClick={handleLoadAnalysis}>
          <Brain className="h-4 w-4" />
          {soal.has_ai_explanation ? 'Lihat Analisis AI' : 'Generate Analisis AI (DCSEF)'}
        </Button>
      ) : loadingAnalysis ? (
        <Card className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></Card>
      ) : analysis ? (
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Analisis AI — DCSEF</p>
            {analysis.from_cache && <span className="rounded px-1.5 py-0.5 text-[10px] text-emerald-500" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>Cached</span>}
          </div>
          {analysis.strategi && (
            <div>
              <p className="text-xs font-semibold t-muted uppercase tracking-wider">Strategi</p>
              <p className="text-sm t-secondary mt-0.5">{analysis.strategi.konsep_utama}</p>
              {analysis.strategi.tips_cepat && (
                <p className="mt-1 text-xs text-amber-500">💡 {analysis.strategi.tips_cepat}</p>
              )}
            </div>
          )}
          {analysis.output && (
            <div className="rounded-lg p-3" style={{ border: '1px solid rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.07)' }}>
              <p className="text-xs font-semibold text-emerald-500">✅ Jawaban: {analysis.output.opsi_benar}</p>
              <p className="text-xs t-muted mt-0.5">{analysis.output.cara_cepat}</p>
              <p className="text-[10px] t-muted mt-1">⏱ Waktu ideal: {analysis.output.waktu_ideal_detik}s</p>
            </div>
          )}
        </Card>
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

// ── Setup screen ───────────────────────────────────────────
function SetupScreen({ onStart }: { onStart: (tipe: string, mapelIds?: number[]) => void }) {
  const [tipe, setTipe] = useState<'harian' | 'ujian'>('harian');
  const [mapelIds, setMapelIds] = useState<number[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const t = searchParams.get('tipe');
    if (t === 'ujian') setTipe('ujian');
  }, [searchParams]);

  const toggleMapel = (id: number) =>
    setMapelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Latihan Soal"
        description="Pilih mode latihan dan mulai belajar SNBT"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Mode harian */}
        <button
          onClick={() => setTipe('harian')}
          className={cn('mode-btn', tipe === 'harian' ? 'active-primary' : '')}>
          <div className="mb-2 text-3xl">📖</div>
          <p className="font-bold t-primary">Latihan Harian</p>
          <p className="mt-1 text-xs t-muted">Soal acak dari bank soal, tanpa batas waktu per soal</p>
          <p className="mt-2 text-xs font-medium" style={{ color: 'var(--primary)' }}>20 soal · Semua mapel</p>
        </button>

        {/* Mode ujian */}
        <button
          onClick={() => setTipe('ujian')}
          className={cn('mode-btn', tipe === 'ujian' ? 'active-warning' : '')}>
          <div className="mb-2 text-3xl">⏱️</div>
          <p className="font-bold t-primary">Simulasi Ujian</p>
          <p className="mt-1 text-xs t-muted">Mirip SNBT asli, ada timer dan semua mapel</p>
          <p className="mt-2 text-xs font-medium text-amber-500">40 soal · Timed</p>
        </button>
      </div>

      {/* Pilih mapel */}
      <Card>
        <p className="mb-3 text-sm font-semibold t-primary">
          Filter Mapel <span className="font-normal t-muted">(opsional — kosong = semua mapel)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {MAPEL_LIST.map((m) => {
            const active = mapelIds.includes(MAPEL_LIST.indexOf(m) + 1);
            return (
              <button
                key={m.kode}
                onClick={() => toggleMapel(MAPEL_LIST.indexOf(m) + 1)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  active
                    ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                    : 'border-theme t-muted hover:border-sky-500/30',
                )}
              >
                <span className={cn('mr-1 rounded px-1 py-0.5 text-[10px]', m.colorClass)}>{m.kode}</span>
                {m.nama.split(' ').slice(0, 2).join(' ')}
              </button>
            );
          })}
        </div>
      </Card>

      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={() => onStart(tipe, mapelIds.length > 0 ? mapelIds : undefined)}
      >
        <BookOpen className="h-4 w-4" />
        Mulai {tipe === 'ujian' ? 'Simulasi' : 'Latihan'}
      </Button>
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

      {/* Soal card */}
      <Card>
        <p className="text-sm leading-relaxed t-primary whitespace-pre-line">{soal.konten}</p>
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
                'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 disabled:cursor-default',
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

  const mulaiMutation = useMutation({
    mutationFn: ({ tipe, mapel_ids }: { tipe: string; mapel_ids?: number[] }) =>
      latihanApi.mulai(tipe, mapel_ids),
    onSuccess: (res) => {
      const d = res.data.data;
      setSesiId(d.id);
      setTotalSoal(d.total_soal);
      setPhase('soal');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? '';
      if (msg.includes('kosong') || err?.response?.status === 404) {
        setEmptyBank(true);
      } else {
        toast.error(msg || 'Gagal memulai sesi latihan.');
      }
      setPhase('setup');
    },
  });

  const selesaiMutation = useMutation({
    mutationFn: (id: number) => latihanApi.selesai(id),
  });

  async function handleStart(t: string, mapelIds?: number[]) {
    setTipe(t);
    setPhase('loading');
    setEmptyBank(false);
    mulaiMutation.mutate({ tipe: t, mapel_ids: mapelIds });
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
