'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { KampusLogo } from '@/components/shared/KampusLogo';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { cn, getMapelColor } from '@/lib/utils';
import Link from 'next/link';
import {
  Flame, Zap, BookOpen, Target, BarChart2, ChevronRight,
  Trophy, TrendingUp, AlertTriangle, Sparkles, Camera, MessageCircle,
  Crown, Star,
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

// ── White Card ─────────────────────────────────────────────
function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('rounded-2xl p-5 bg-white', className)}
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', ...style }}
    >
      {children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconColor, iconBg }: {
  icon: any; label: string; value: string | number; sub?: string;
  iconColor: string; iconBg: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 bg-white transition-all duration-200 hover:-translate-y-0.5"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>{label}</p>
          <p className="mt-1.5 text-3xl font-black" style={{ color: '#0f172a' }}>{value}</p>
          {sub && <p className="mt-0.5 text-xs" style={{ color: '#94a3b8' }}>{sub}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-5 bg-white" style={{ border: '1px solid rgba(14,165,233,0.12)' }}>
            <Skeleton className="h-16" />
          </div>
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
    <div className="text-center py-10">
      <div className="text-4xl mb-3">📚</div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Bank soal belum tersedia</p>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
        style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}>
        <Sparkles className="h-3 w-3" /> Sedang digenerate
      </div>
    </div>
  );
}

// ── Quick Action Link ──────────────────────────────────────
function QuickLink({ href, icon: Icon, label, desc, iconColor, iconBg }: {
  href: string; icon: any; label: string; desc: string;
  iconColor: string; iconBg: string;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3 rounded-xl p-3 group transition-all duration-200 hover:-translate-y-px"
      style={{ border: '1px solid rgba(14,165,233,0.10)', backgroundColor: '#f8fbff' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary-muted)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-border)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fbff';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.10)';
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: iconBg }}>
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--text-muted)' }} />
    </Link>
  );
}

// ── Section Header ─────────────────────────────────────────
function SectionHeader({ icon: Icon, title, iconColor, iconBg, linkText, linkHref }: {
  icon: any; title: string; iconColor: string; iconBg: string; linkText?: string; linkHref?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-bold flex items-center gap-2 text-[15px]" style={{ color: 'var(--text-primary)' }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: iconBg }}>
          <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
        </div>
        {title}
      </h2>
      {linkText && linkHref && (
        <Link href={linkHref} className="text-xs font-semibold transition-colors hover:opacity-75"
          style={{ color: 'var(--primary)' }}>{linkText} →</Link>
      )}
    </div>
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

      {/* ═══ Hero Welcome Banner ═══ */}
      <div
        className="rounded-2xl p-6 sm:p-8 bg-white"
        style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>
              Selamat datang kembali 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: '#0f172a' }}>
              {user?.name?.split(' ')[0] ?? 'Pejuang'}
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
              Dashboard belajar SNBT-mu hari ini
            </p>
            {d?.target_harian_tercapai && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047', color: '#a16207' }}>
                <Star className="h-3 w-3" /> Target harian tercapai!
              </div>
            )}
          </div>
          <Link href="/latihan">
            <button
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}
            >
              <BookOpen className="h-4 w-4" /> Mulai Latihan
            </button>
          </Link>
        </div>
      </div>

      {/* ═══ Stats row ═══ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame}    label="Streak Harian"   value={d?.streak ?? user?.streak_days ?? 0}             sub="hari berturut-turut"  iconColor="#f97316" iconBg="rgba(249,115,22,0.10)" />
        <StatCard icon={Zap}      label="Total Poin"       value={(d?.points ?? user?.points ?? 0).toLocaleString('id')} sub="poin terkumpul"   iconColor="#d97706" iconBg="rgba(245,158,11,0.10)" />
        <StatCard icon={BookOpen} label="Soal Dikerjakan"  value={d?.total_soal_dikerjakan ?? 0}                   sub="total semua sesi"  iconColor="var(--primary)" iconBg="var(--primary-muted)" />
        <StatCard icon={Target}   label="Akurasi Overall"  value={`${d?.akurasi_overall ?? 0}%`}                   sub="rata-rata semua mapel" iconColor="#10b981" iconBg="rgba(16,185,129,0.10)" />
      </div>

      {/* ═══ Main grid ═══ */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Target Kampus */}
        <Card>
          <SectionHeader icon={Target} title="Target Kampus"
            iconColor="var(--primary)" iconBg="var(--primary-muted)"
            linkText="Ubah" linkHref="/onboarding" />

          {targetsLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : targets.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Target className="h-8 w-8 mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada target kampus.</p>
              <Link href="/onboarding" className="mt-2 text-xs font-semibold" style={{ color: 'var(--primary)' }}>+ Tambah target</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {targets.map((t: any, i: number) => {
                const colors = [
                  { gradient: 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))', bg: 'var(--secondary-muted)', border: 'var(--secondary-border)', text: 'var(--secondary-dark)' },
                  { gradient: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',     bg: 'var(--primary-muted)',   border: 'var(--primary-border)',   text: 'var(--primary)' },
                  { gradient: 'linear-gradient(135deg, var(--tertiary), var(--tertiary-dark))',   bg: 'var(--tertiary-muted)',  border: 'var(--tertiary-border)',  text: 'var(--tertiary)' },
                ];
                const c = colors[i] ?? colors[2];
                return (
                  <div key={t.kampus?.id ?? i} className="flex items-center gap-3 rounded-xl p-3"
                    style={{ border: `1px solid ${c.border}`, backgroundColor: c.bg }}>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm"
                      style={{ background: c.gradient }}>
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
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ color: c.text, backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                        {Number(t.jurusan.passing_grade_estimate).toFixed(1)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Progress per Mapel */}
        <Card>
          <SectionHeader icon={TrendingUp} title="Progress per Mapel"
            iconColor="var(--tertiary)" iconBg="var(--tertiary-muted)"
            linkText="Detail" linkHref="/weakness" />
          {!d || d.progres_per_mapel.length === 0 ? (
            <EmptyBankSoal />
          ) : (
            <div className="space-y-3.5">
              {d.progres_per_mapel.map((p) => (
                <div key={p.mapel.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', getMapelColor(p.mapel.kode))}>
                        {p.mapel.kode}
                      </span>
                      <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--text-secondary)' }}>{p.mapel.nama}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{p.akurasi}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.10)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.akurasi}%`,
                        background: p.akurasi >= 70
                          ? 'linear-gradient(90deg, var(--tertiary), var(--tertiary-light))'
                          : p.akurasi >= 50
                            ? 'linear-gradient(90deg, var(--secondary-dark), var(--secondary))'
                            : 'linear-gradient(90deg, #dc2626, #ef4444)',
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
          <SectionHeader icon={AlertTriangle} title="Kelemahan Kritis"
            iconColor="#ef4444" iconBg="rgba(239,68,68,0.08)"
            linkText="Semua" linkHref="/weakness" />
          {!d || d.kelemahan_kritis.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              {isNewUser ? (
                <>
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                    Kerjakan latihan soal dulu untuk melihat analisis kelemahanmu!
                  </p>
                  <Link href="/latihan">
                    <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                      Mulai Latihan
                    </button>
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
                  style={{ border: '1px solid rgba(239,68,68,0.15)', backgroundColor: 'rgba(239,68,68,0.04)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{k.sub_materi.nama}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{k.mapel.nama}</p>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{k.accuracy_rate}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{k.attempt_count} soal</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <SectionHeader icon={Sparkles} title="Mulai Belajar"
            iconColor="var(--secondary)" iconBg="var(--secondary-muted)" />
          <div className="space-y-2">
            {[
              { href: '/latihan?tipe=harian', icon: BookOpen,     label: 'Latihan Harian',     desc: 'Soal acak dari semua mapel',  iconColor: 'var(--primary)',      iconBg: 'var(--primary-muted)' },
              { href: '/latihan?tipe=ujian',  icon: Trophy,        label: 'Mode Simulasi SNBT', desc: 'Waktu terbatas, semua mapel', iconColor: 'var(--secondary-dark)', iconBg: 'var(--secondary-muted)' },
              { href: '/weakness',            icon: BarChart2,     label: 'Latihan Kelemahan',  desc: 'Fokus pada sub-materi lemah', iconColor: '#ef4444',              iconBg: 'rgba(239,68,68,0.08)'  },
              { href: '/ai/photo-solve',      icon: Camera,        label: 'Foto Soal AI',       desc: 'Analisis soal dari foto',     iconColor: 'var(--tertiary)',      iconBg: 'var(--tertiary-muted)' },
              { href: '/ai/tanya',            icon: MessageCircle, label: 'Tanya AI',           desc: 'Tanya konsep SNBT apapun',   iconColor: '#06b6d4',              iconBg: 'rgba(6,182,212,0.10)'  },
            ].map((item) => <QuickLink key={item.href} {...item} />)}
          </div>
        </Card>
      </div>

      {/* ═══ Leaderboard teaser ═══ */}
      <div
        className="rounded-2xl py-8 px-6 text-center bg-white"
        style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
      >
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl mb-3"
          style={{ backgroundColor: '#fef9c3' }}>
          <Trophy className="h-6 w-6" style={{ color: '#d97706' }} />
        </div>
        <p className="font-bold text-base" style={{ color: '#0f172a' }}>
          Lihat posisimu di Leaderboard Nasional
        </p>
        <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
          Bersaing dengan ribuan pejuang SNBT se-Indonesia
        </p>
        <Link href="/leaderboard">
          <button className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#fef9c3', color: '#92400e', border: '1px solid #fde047' }}>
            <Trophy className="h-4 w-4" /> Lihat Leaderboard →
          </button>
        </Link>
      </div>
    </div>
  );
}
