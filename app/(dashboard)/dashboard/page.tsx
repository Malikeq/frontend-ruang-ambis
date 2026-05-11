'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { KampusLogo } from '@/components/shared/KampusLogo';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { cn, getMapelColor } from '@/lib/utils';
import Link from 'next/link';
import {
  Flame, Zap, BookOpen, Target, BarChart2, ChevronRight,
  Trophy, TrendingUp, AlertTriangle, Sparkles, Camera, MessageCircle,
} from 'lucide-react';

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
function StatCard({ icon: Icon, label, value, sub, iconColor, iconBg }: {
  icon: any; label: string; value: string | number; sub?: string;
  iconColor: string; iconBg: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="mt-1.5 text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
          {sub && <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
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

// ── Empty bank soal ────────────────────────────────────────
function EmptyBankSoal() {
  return (
    <Card className="col-span-full text-center py-12">
      <div className="text-5xl mb-3">📚</div>
      <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Bank Soal Belum Tersedia</h3>
      <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
        Admin sedang menyiapkan soal-soal berkualitas untukmu. Pantau terus — soal akan segera tersedia!
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
        style={{ backgroundColor: 'var(--primary-muted)', border: '1px solid var(--primary-border)', color: 'var(--primary)' }}>
        <Sparkles className="h-3.5 w-3.5" /> Soal AI sedang digenerate
      </div>
    </Card>
  );
}

// ── Quick Action Link ──────────────────────────────────────
function QuickLink({ href, icon: Icon, label, desc, iconColor, iconBg }: {
  href: string; icon: any; label: string; desc: string;
  iconColor: string; iconBg: string;
}) {
  return (
    <Link href={href} className="card-hover flex items-center gap-3 rounded-xl p-3 group"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: iconBg }}>
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
    </Link>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: targetsData, isLoading: targetsLoading } = useQuery({
    queryKey: ['user-targets'],
    queryFn: () => userApi.getTargets(),
    staleTime: 5 * 60_000,
  });

  if (isLoading) return <DashboardSkeleton />;

  const d: DashboardData | null = data?.data?.data ?? null;
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
        <StatCard icon={Flame}     label="Streak Harian"   value={d?.streak ?? user?.streak_days ?? 0}             sub="hari berturut-turut" iconColor="#f97316" iconBg="rgba(249,115,22,0.12)" />
        <StatCard icon={Zap}       label="Total Poin"      value={(d?.points ?? user?.points ?? 0).toLocaleString('id')} sub="poin terkumpul"   iconColor="#eab308" iconBg="rgba(234,179,8,0.12)"  />
        <StatCard icon={BookOpen}  label="Soal Dikerjakan" value={d?.total_soal_dikerjakan ?? 0}                   sub="total semua sesi" iconColor="var(--primary)" iconBg="var(--primary-muted)" />
        <StatCard icon={Target}    label="Akurasi Overall" value={`${d?.akurasi_overall ?? 0}%`}                   sub="rata-rata semua mapel" iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Target Kampus */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Target Kampus
            </h2>
            <Link href="/onboarding" className="auth-link text-xs">Ubah</Link>
          </div>

          {targetsLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : targets.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Target className="h-8 w-8 mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada target kampus.</p>
              <Link href="/onboarding" className="auth-link mt-2 text-xs">+ Tambah target</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {targets.map((t: any, i: number) => (
                <div key={t.kampus?.id ?? i} className="flex items-center gap-3 rounded-xl p-3"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                    {t.priority ?? i + 1}
                  </div>
                  {t.kampus && <KampusLogo kampus={t.kampus} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {t.kampus?.akronim ?? t.kampus?.nama ?? '—'}
                    </p>
                    <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{t.jurusan?.nama ?? '—'}</p>
                  </div>
                  {t.jurusan?.passing_grade_estimate && (
                    <span className="shrink-0 text-xs font-bold" style={{ color: '#10b981' }}>
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
            <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Progress per Mapel
            </h2>
            <Link href="/weakness" className="auth-link text-xs">Detail</Link>
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
                      <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--text-secondary)' }}>{p.mapel.nama}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{p.akurasi}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.akurasi}%`,
                        backgroundColor: p.akurasi >= 70 ? '#10b981' : p.akurasi >= 50 ? '#f59e0b' : '#ef4444',
                      }}
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
            <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <AlertTriangle className="h-4 w-4 text-red-500" /> Kelemahan Kritis
            </h2>
            <Link href="/weakness" className="auth-link text-xs">Semua</Link>
          </div>
          {!d || d.kelemahan_kritis.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              {isNewUser ? (
                <>
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Kerjakan latihan soal dulu untuk melihat analisis kelemahanmu!</p>
                  <Link href="/latihan">
                    <Button variant="gradient" size="sm" className="mt-3">Mulai Latihan</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tidak ada kelemahan kritis. Bagus!</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {d.kelemahan_kritis.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl p-3"
                  style={{ border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.05)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{k.sub_materi.nama}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{k.mapel.nama}</p>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    <p className="text-sm font-bold text-red-500">{k.accuracy_rate}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{k.attempt_count} soal</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="mb-4 font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Mulai Belajar
          </h2>
          <div className="space-y-2.5">
            {[
              { href: '/latihan?tipe=harian', icon: BookOpen,     label: 'Latihan Harian',     desc: 'Soal acak dari semua mapel',  iconColor: 'var(--primary)', iconBg: 'var(--primary-muted)' },
              { href: '/latihan?tipe=ujian',  icon: Trophy,        label: 'Mode Simulasi SNBT', desc: 'Waktu terbatas, semua mapel', iconColor: '#f59e0b',        iconBg: 'rgba(245,158,11,0.12)'  },
              { href: '/weakness',            icon: BarChart2,     label: 'Latihan Kelemahan',  desc: 'Fokus pada sub-materi lemah', iconColor: '#ef4444',        iconBg: 'rgba(239,68,68,0.10)'   },
              { href: '/ai/photo-solve',      icon: Camera,        label: 'Foto Soal AI',       desc: 'Analisis soal dari foto',     iconColor: '#10b981',        iconBg: 'rgba(16,185,129,0.12)'  },
              { href: '/ai/tanya',            icon: MessageCircle, label: 'Tanya AI',           desc: 'Tanya konsep SNBT apapun',    iconColor: '#06b6d4',        iconBg: 'rgba(6,182,212,0.12)'   },
            ].map((item) => <QuickLink key={item.href} {...item} />)}
          </div>
        </Card>
      </div>

      {/* Leaderboard teaser */}
      <Card className="text-center py-6">
        <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Lihat posisimu di Leaderboard Nasional</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Bersaing dengan ribuan pejuang SNBT se-Indonesia</p>
        <Link href="/leaderboard">
          <Button variant="secondary" size="sm" className="mt-4">Lihat Leaderboard →</Button>
        </Link>
      </Card>
    </div>
  );
}
