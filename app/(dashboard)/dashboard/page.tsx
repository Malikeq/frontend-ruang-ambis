'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { KampusLogo } from '@/components/shared/KampusLogo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { Skeleton } from '@/components/ui/Spinner';
import { cn, getMapelColor, calcPercentage } from '@/lib/utils';
import Link from 'next/link';
import {
  Flame, Zap, BookOpen, Target, BarChart2, ChevronRight,
  Trophy, TrendingUp, AlertTriangle, Sparkles, Camera, MessageCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────
interface DashboardData {
  user: { name: string; tier: string; kampusTargets: any[] };
  streak: number;
  points: number;
  total_soal_dikerjakan: number;
  akurasi_overall: number;
  sesi_hari_ini: number;
  target_harian_tercapai: boolean;
  kelemahan_kritis: Array<{
    id: number;
    sub_materi: { nama: string };
    mapel: { nama: string; kode: string };
    accuracy_rate: number;
    attempt_count: number;
  }>;
  progres_per_mapel: Array<{
    mapel: { id: number; nama: string; kode: string };
    akurasi: number;
    attempt_count: number;
  }>;
}

// ── Stat Card ─────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-[#6366f1]',
  bg = 'bg-[rgba(99,102,241,0.1)]',
}: {
  icon: any; label: string; value: string | number; sub?: string;
  color?: string; bg?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-3xl font-black text-[#f1f5f9]">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-[#475569]">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
      </div>
    </Card>
  );
}

// ── Loading skeleton ───────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><Skeleton className="h-16" /></Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Skeleton className="h-48" /></Card>
        <Card><Skeleton className="h-48" /></Card>
      </div>
    </div>
  );
}

// ── Empty state (no soal yet) ──────────────────────────────
function EmptyBankSoal() {
  return (
    <Card className="col-span-full text-center py-12">
      <div className="text-5xl mb-3">📚</div>
      <h3 className="font-bold text-[#f1f5f9] mb-1">Bank Soal Belum Tersedia</h3>
      <p className="text-sm text-[#64748b] max-w-xs mx-auto">
        Admin sedang menyiapkan soal-soal berkualitas untukmu. Pantau terus — soal akan segera tersedia!
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] px-4 py-1.5 text-xs text-[#a5b4fc]">
        <Sparkles className="h-3.5 w-3.5" /> Soal AI sedang digenerate
      </div>
    </Card>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
    staleTime: 60_000,
    retry: 1,
  });

  // Dedicated query for kampus targets — fetches from /user/targets
  const { data: targetsData, isLoading: targetsLoading } = useQuery({
    queryKey: ['user-targets'],
    queryFn: () => userApi.getTargets(),
    staleTime: 5 * 60_000,  // 5 min cache
  });

  if (isLoading) return <DashboardSkeleton />;

  const d: DashboardData | null = data?.data?.data ?? null;
  // Targets come from dedicated endpoint (most reliable) with fallback to dashboard user obj
  const targets: any[] = targetsData?.data?.data ?? d?.user?.kampusTargets ?? user?.kampusTargets ?? [];
  const isNewUser = !d || d.total_soal_dikerjakan === 0;


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={`Halo, ${user?.name?.split(' ')[0] ?? 'Pejuang'} 👋`}
        description="Dashboard belajar SNBT-mu hari ini"
        action={
          <Link href="/latihan">
            <Button variant="gradient" size="sm">
              <BookOpen className="h-4 w-4" /> Mulai Latihan
            </Button>
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Streak Harian"
          value={d?.streak ?? user?.streak_days ?? 0}
          sub="hari berturut-turut"
          color="text-orange-400"
          bg="bg-[rgba(251,146,60,0.1)]"
        />
        <StatCard
          icon={Zap}
          label="Total Poin"
          value={(d?.points ?? user?.points ?? 0).toLocaleString('id')}
          sub="poin terkumpul"
          color="text-yellow-400"
          bg="bg-[rgba(234,179,8,0.1)]"
        />
        <StatCard
          icon={BookOpen}
          label="Soal Dikerjakan"
          value={d?.total_soal_dikerjakan ?? 0}
          sub="total semua sesi"
          color="text-[#6366f1]"
          bg="bg-[rgba(99,102,241,0.1)]"
        />
        <StatCard
          icon={Target}
          label="Akurasi Overall"
          value={`${d?.akurasi_overall ?? 0}%`}
          sub="rata-rata semua mapel"
          color="text-[#10b981]"
          bg="bg-[rgba(16,185,129,0.1)]"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-2">

          {/* Target Kampus */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
                <Target className="h-4 w-4 text-[#6366f1]" /> Target Kampus
              </h2>
              <Link href="/onboarding" className="text-xs text-[#6366f1] hover:underline">Ubah</Link>
            </div>

            {targetsLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : targets.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Target className="h-8 w-8 text-[#334155] mb-2" />
                <p className="text-sm text-[#475569]">Belum ada target kampus.</p>
                <Link href="/onboarding" className="mt-2 text-xs text-[#6366f1] hover:underline">+ Tambah target</Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {targets.map((t: any, i: number) => (
                  <div key={t.kampus?.id ?? i} className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
                    {/* Priority number */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-black text-white">
                      {t.priority ?? i + 1}
                    </div>
                    {/* Campus logo via logo.dev */}
                    {t.kampus && <KampusLogo kampus={t.kampus} size="sm" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#f1f5f9]">
                        {t.kampus?.akronim ?? t.kampus?.nama ?? '—'}
                      </p>
                      <p className="truncate text-xs text-[#64748b]">{t.jurusan?.nama ?? '—'}</p>
                    </div>
                    {t.jurusan?.passing_grade_estimate && (
                      <span className="shrink-0 text-xs font-bold text-[#10b981]">
                        {Number(t.jurusan.passing_grade_estimate).toFixed(1)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

        {/* Progress per Mapel */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#6366f1]" /> Progress per Mapel
            </h2>
            <Link href="/weakness" className="text-xs text-[#6366f1] hover:underline">Detail</Link>
          </div>
          {!d || d.progres_per_mapel.length === 0 ? (
            <EmptyBankSoal />
          ) : (
            <div className="space-y-3">
              {d.progres_per_mapel.map((p) => (
                <div key={p.mapel.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', getMapelColor(p.mapel.kode))}>
                        {p.mapel.kode}
                      </span>
                      <span className="text-xs text-[#94a3b8] truncate max-w-[140px]">{p.mapel.nama}</span>
                    </div>
                    <span className="text-xs font-bold text-[#f1f5f9]">{p.akurasi}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        p.akurasi >= 70 ? 'bg-[#10b981]' : p.akurasi >= 50 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]',
                      )}
                      style={{ width: `${p.akurasi}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Kelemahan Kritis */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#ef4444]" /> Kelemahan Kritis
            </h2>
            <Link href="/weakness" className="text-xs text-[#6366f1] hover:underline">Semua</Link>
          </div>
          {!d || d.kelemahan_kritis.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              {isNewUser ? (
                <>
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm text-[#64748b]">Kerjakan latihan soal dulu untuk melihat analisis kelemahanmu!</p>
                  <Link href="/latihan">
                    <Button variant="gradient" size="sm" className="mt-3">Mulai Latihan</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm text-[#64748b]">Tidak ada kelemahan kritis. Bagus!</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {d.kelemahan_kritis.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.05)] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#f1f5f9]">{k.sub_materi.nama}</p>
                    <p className="text-xs text-[#64748b]">{k.mapel.nama}</p>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    <p className="text-sm font-bold text-[#ef4444]">{k.accuracy_rate}%</p>
                    <p className="text-[10px] text-[#475569]">{k.attempt_count} soal</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="mb-4 font-semibold text-[#f1f5f9] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#6366f1]" /> Mulai Belajar
          </h2>
          <div className="space-y-2.5">
            {[
              { href: '/latihan?tipe=harian', icon: BookOpen,        label: 'Latihan Harian',    desc: 'Soal acak dari semua mapel',   color: 'text-[#6366f1]',  bg: 'bg-[rgba(99,102,241,0.1)]'  },
              { href: '/latihan?tipe=ujian',  icon: Trophy,           label: 'Mode Simulasi SNBT',desc: 'Waktu terbatas, semua mapel',  color: 'text-[#f59e0b]',  bg: 'bg-[rgba(245,158,11,0.1)]'  },
              { href: '/weakness',            icon: BarChart2,        label: 'Latihan Kelemahan', desc: 'Fokus pada sub-materi lemah',  color: 'text-[#ef4444]',  bg: 'bg-[rgba(239,68,68,0.1)]'   },
              { href: '/ai/photo-solve',      icon: Camera,           label: 'Foto Soal AI',      desc: 'Analisis soal dari foto',      color: 'text-[#10b981]',  bg: 'bg-[rgba(16,185,129,0.1)]'  },
              { href: '/ai/tanya',            icon: MessageCircle,    label: 'Tanya AI',          desc: 'Tanya konsep SNBT apapun',     color: 'text-[#06b6d4]',  bg: 'bg-[rgba(6,182,212,0.1)]'   },
            ].map(({ href, icon: Icon, label, desc, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.04)] transition-all group"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', bg)}>
                  <Icon className={cn('h-4 w-4', color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#f1f5f9]">{label}</p>
                  <p className="text-xs text-[#475569]">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#334155] group-hover:text-[#6366f1] transition-colors" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Leaderboard teaser */}
      <Card className="text-center py-6">
        <Trophy className="h-8 w-8 text-[#f59e0b] mx-auto mb-2" />
        <p className="font-semibold text-[#f1f5f9]">Lihat posisimu di Leaderboard Nasional</p>
        <p className="mt-1 text-sm text-[#64748b]">Bersaing dengan ribuan pejuang SNBT se-Indonesia</p>
        <Link href="/leaderboard">
          <Button variant="secondary" size="sm" className="mt-4">Lihat Leaderboard →</Button>
        </Link>
      </Card>
    </div>
  );
}
