'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import { KampusLogo } from '@/components/shared/KampusLogo';
import { toast } from 'sonner';
import { Search, X, Check, ChevronRight, MapPin, Building2 } from 'lucide-react';

// ── Types ────────────────────────────────────────────────
interface Kampus {
  id: number;
  nama: string;
  akronim: string;
  kota?: string;
  provinsi?: string;
  logo_url?: string | null;
  jurusan_count?: number;
}
interface Jurusan {
  id: number;
  nama: string;
  fakultas?: string;
  passing_grade_estimate?: number | null;
  peminat_tahun_lalu?: number | null;
}
interface Target { kampus: Kampus; jurusan: Jurusan; }

const STEPS = ['Kenalan', 'Kampus Impian', 'Selesai'];

const REFERRAL_OPTIONS = [
  { id: 'instagram', label: 'Instagram',     emoji: '📸' },
  { id: 'tiktok',    label: 'TikTok',        emoji: '🎵' },
  { id: 'youtube',   label: 'YouTube',       emoji: '▶️'  },
  { id: 'google',    label: 'Google Search', emoji: '🔍' },
  { id: 'teman',     label: 'Teman / Kakak', emoji: '👥' },
  { id: 'twitter',   label: 'Twitter / X',   emoji: '🐦' },
  { id: 'forum',     label: 'Forum / Reddit', emoji: '💬' },
  { id: 'lainnya',   label: 'Lainnya',       emoji: '✨' },
];


// ── Step 1: Referral ─────────────────────────────────────
function StepKenalan({ onNext }: { onNext: (ref: string) => void }) {
  const [selected, setSelected] = useState('');
  return (
    <div>
      <div className="mb-7 text-center">
        <div className="mb-3 text-5xl">👋</div>
        <h2 className="text-2xl font-black text-[#f1f5f9]">Hei! Selamat Datang</h2>
        <p className="mt-2 text-sm text-[#64748b]">Dari mana kamu tahu tentang <span className="font-semibold text-[#a5b4fc]">AI Lolos PTN</span>?</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {REFERRAL_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 transition-all duration-200 ${
              selected === opt.id
                ? 'border-[rgba(99,102,241,0.7)] bg-[rgba(99,102,241,0.15)] scale-[1.03] shadow-lg shadow-[rgba(99,102,241,0.15)]'
                : 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.04)]'
            }`}
          >
            {selected === opt.id && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6366f1]">
                <Check className="h-3 w-3 text-white" />
              </span>
            )}
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-center text-xs font-medium leading-tight text-[#94a3b8]">{opt.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        className="mt-7 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgba(99,102,241,0.3)] disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        {selected ? 'Lanjut →' : 'Pilih salah satu dulu'}
      </button>
    </div>
  );
}

// ── Step 2: Kampus & Jurusan ─────────────────────────────
function StepKampus({ onNext }: { onNext: (targets: Target[]) => void }) {
  const [search, setSearch]           = useState('');
  const [targets, setTargets]         = useState<Target[]>([]);
  const [pickingFor, setPickingFor]   = useState<Kampus | null>(null);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loadingJ, setLoadingJ]       = useState(false);
  const debouncedSearch               = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ['kampus', debouncedSearch],
    queryFn:  () => onboardingApi.getKampus(debouncedSearch || undefined),
    staleTime: 30_000,
  });

  // API returns: { data: { success, data: [...kampus] } }
  const allKampus: Kampus[] = data?.data?.data ?? [];

  const handlePickKampus = useCallback(async (k: Kampus) => {
    if (targets.find(t => t.kampus.id === k.id)) {
      // Deselect
      setTargets(prev => prev.filter(t => t.kampus.id !== k.id));
      return;
    }
    if (targets.length >= 3) { toast.warning('Maksimal 3 kampus'); return; }
    setPickingFor(k);
    setLoadingJ(true);
    try {
      const res = await onboardingApi.getJurusan(k.id);
      setJurusanList(res.data.data ?? []);
    } catch { toast.error('Gagal memuat jurusan'); setPickingFor(null); }
    finally   { setLoadingJ(false); }
  }, [targets]);

  const handlePickJurusan = (j: Jurusan) => {
    if (!pickingFor) return;
    setTargets(prev => [...prev.filter(t => t.kampus.id !== pickingFor.id), { kampus: pickingFor, jurusan: j }]);
    setPickingFor(null);
    setJurusanList([]);
  };

  // ── Jurusan picker ──────────────────────────────────────
  if (pickingFor) {
    return (
      <div>
        <div className="mb-5 flex items-center gap-3">
          <button onClick={() => setPickingFor(null)} className="rounded-lg p-1.5 text-[#64748b] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f1f5f9] transition-all">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <KampusLogo kampus={pickingFor} size="sm" />
            <div className="min-w-0">
              <p className="text-xs text-[#64748b]">Pilih jurusan di</p>
              <p className="truncate font-bold text-[#f1f5f9]">{pickingFor.nama}</p>
            </div>
          </div>
        </div>

        {loadingJ ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
          </div>
        ) : jurusanList.length === 0 ? (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] p-6 text-center">
            <p className="text-sm text-[#475569]">Belum ada data jurusan untuk kampus ini.</p>
            <button onClick={() => setPickingFor(null)} className="mt-3 text-xs text-[#6366f1] hover:underline">← Kembali pilih kampus</button>
          </div>
        ) : (
          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {jurusanList.map(j => {
              // Safely convert to number, handle null/string from DB
              const pg = j.passing_grade_estimate != null ? Number(j.passing_grade_estimate) : null;
              return (
                <button key={j.id} onClick={() => handlePickJurusan(j)}
                  className="flex w-full items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3.5 text-left hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.05)] transition-all group">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#f1f5f9]">{j.nama}</p>
                    {j.fakultas && <p className="text-xs text-[#475569]">{j.fakultas}</p>}
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    {pg != null && pg > 0 && (
                      <p className="text-xs font-bold text-[#10b981]">{pg.toFixed(1)}%</p>
                    )}
                    {j.peminat_tahun_lalu != null && j.peminat_tahun_lalu > 0 && (
                      <p className="text-[10px] text-[#475569]">{j.peminat_tahun_lalu.toLocaleString('id')} peminat</p>
                    )}
                    <ChevronRight className="ml-auto mt-1 h-4 w-4 text-[#475569] group-hover:text-[#6366f1]" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Kampus list ─────────────────────────────────────────
  const filtered = search.length >= 1
    ? allKampus.filter(k =>
        k.nama.toLowerCase().includes(search.toLowerCase()) ||
        k.akronim.toLowerCase().includes(search.toLowerCase())
      )
    : allKampus;

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="mb-2 text-4xl">🎯</div>
        <h2 className="text-2xl font-black text-[#f1f5f9]">Pilih Kampus Impian</h2>
        <p className="mt-1 text-sm text-[#64748b]">Pilih hingga <strong className="text-[#a5b4fc]">3 kampus</strong> beserta jurusannya</p>
      </div>

      {/* Selected targets */}
      {targets.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6366f1]">Pilihan kamu ({targets.length}/3)</p>
          {targets.map((t, i) => (
            <div key={t.kampus.id} className="flex items-center gap-3 rounded-xl border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.08)] p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-black text-white">{i + 1}</div>
              <KampusLogo kampus={t.kampus} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#f1f5f9]">{t.kampus.akronim}</p>
                <p className="truncate text-xs text-[#64748b]">{t.jurusan.nama}</p>
              </div>
              <button onClick={() => setTargets(prev => prev.filter(x => x.kampus.id !== t.kampus.id))} className="shrink-0 text-[#475569] hover:text-red-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari kampus... (UI, ITB, UGM, UNDIP...)"
          className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] pl-10 pr-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
        />
      </div>

      {/* Kampus list */}
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#475569]">Tidak ada kampus ditemukan.</p>
        ) : (
          filtered.slice(0, 40).map(k => {
            const isSelected = targets.some(t => t.kampus.id === k.id);
            return (
              <button key={k.id} onClick={() => handlePickKampus(k)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-[rgba(99,102,241,0.55)] bg-[rgba(99,102,241,0.1)]'
                    : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.04)]'
                }`}>
                <KampusLogo kampus={k} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#f1f5f9]">{k.nama}</p>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    {k.kota && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{k.kota}</span>}
                    {k.jurusan_count != null && k.jurusan_count > 0 && (
                      <span className="flex items-center gap-0.5"><Building2 className="h-3 w-3" />{k.jurusan_count} jurusan</span>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-[#6366f1]" />}
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={() => targets.length > 0 && onNext(targets)}
        disabled={targets.length === 0}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgba(99,102,241,0.25)] disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        {targets.length === 0 ? 'Pilih minimal 1 kampus' : `Simpan ${targets.length} Target →`}
      </button>
    </div>
  );
}

// ── Step 3: Done ─────────────────────────────────────────
function StepSelesai({ targets }: { targets: Target[] }) {
  return (
    <div className="text-center">
      <div className="mb-4 text-6xl">🎉</div>
      <h2 className="text-2xl font-black text-[#f1f5f9]">Siap Berjuang!</h2>
      <p className="mt-2 text-sm text-[#64748b]">Target tersimpan. Mulai belajar dan raih kampus impian!</p>
      <div className="mt-6 space-y-2">
        {targets.map((t, i) => (
          <div key={t.kampus.id} className="flex items-center gap-3 rounded-xl border border-[rgba(99,102,241,0.25)] bg-[rgba(99,102,241,0.08)] p-4 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-black text-white">{i + 1}</div>
            <KampusLogo kampus={t.kampus} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-bold text-[#f1f5f9]">{t.kampus.akronim} — {t.jurusan.nama}</p>
              <p className="truncate text-xs text-[#64748b]">{t.kampus.nama}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Onboarding Page ─────────────────────────────────
export default function OnboardingPage() {
  const router          = useRouter();
  const qc              = useQueryClient();
  const { setUser }     = useAuthStore();
  const [step, setStep] = useState(0);
  const [targets, setTargets]   = useState<Target[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleStep1 = async (ref: string) => {
    // Best-effort save of referral source — non-blocking
    try {
      await onboardingApi.saveReferral(ref);
    } catch {
      // Silently ignore — referral is analytics data, not blocking UX
    }
    setStep(1);
  };

  const handleStep2 = async (t: Target[]) => {
    setTargets(t);
    setSubmitting(true);
    try {
      const payload = t.map((tg, i) => ({
        kampus_id: tg.kampus.id, jurusan_id: tg.jurusan.id, priority: i + 1,
      }));
      await onboardingApi.setTarget(payload);
      await onboardingApi.complete();
      const meRes = await authApi.me();
      setUser(meRes.data.data);
      // Invalidate queries so dashboard reflects new targets immediately
      await qc.invalidateQueries({ queryKey: ['user-targets'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      setStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Gagal menyimpan target, coba lagi');
    } finally { setSubmitting(false); }
  };

  const pct = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            ✦ AI Lolos PTN
          </span>

          {/* Step bubbles */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i < step  ? 'bg-[#10b981] text-white' :
                  i === step ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-[rgba(99,102,241,0.4)]' :
                               'bg-[rgba(255,255,255,0.06)] text-[#475569]'
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`hidden text-xs sm:block ${i === step ? 'font-semibold text-[#f1f5f9]' : 'text-[#475569]'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`hidden h-px w-8 sm:block transition-colors ${i < step ? 'bg-[#10b981]' : 'bg-[rgba(255,255,255,0.08)]'}`} />}
              </div>
            ))}
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141428] p-6 shadow-2xl">
          {submitting && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[rgba(8,8,22,0.85)]">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
              <p className="text-sm font-medium text-[#94a3b8]">Menyimpan target kampus...</p>
            </div>
          )}

          {step === 0 && <StepKenalan onNext={handleStep1} />}
          {step === 1 && <StepKampus  onNext={handleStep2} />}
          {step === 2 && (
            <>
              <StepSelesai targets={targets} />
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-7 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgba(99,102,241,0.3)] hover:opacity-90 transition-opacity"
              >
                Mulai Belajar Sekarang 🚀
              </button>
            </>
          )}
        </div>

        {step < 2 && (
          <p className="mt-4 text-center text-xs text-[#334155]">Bisa diubah kapan saja melalui pengaturan profil</p>
        )}
      </div>
    </div>
  );
}
