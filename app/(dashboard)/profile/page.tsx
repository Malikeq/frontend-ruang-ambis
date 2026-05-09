'use client';

import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { KampusLogo } from '@/components/shared/KampusLogo';
import { cn, getInitials, getTierColor } from '@/lib/utils';
import { TIER_LABELS } from '@/lib/constants';
import {
  Mail, Shield, Target, Flame, Zap,
  BookOpen, Star, ChevronRight, CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuthStore();
  if (!user) return null;

  const tier = user.tier;
  const tierBadgeVariant: 'premium' | 'default' | 'free' =
    tier === 'premium' ? 'premium' : tier === 'daily_pass' ? 'default' : 'free';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Profil Saya"
        description="Informasi akun dan progres belajarmu"
        action={
          <Link href="/latihan">
            <Button variant="gradient" size="sm">
              <BookOpen className="h-4 w-4" /> Lanjut Belajar
            </Button>
          </Link>
        }
      />

      {/* Profile card */}
      <Card>
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xl font-black text-white">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-[#f1f5f9]">{user.name}</h2>
              <Badge variant={tierBadgeVariant}>{TIER_LABELS[tier] ?? tier}</Badge>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-[#64748b]">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#475569]">
              <Shield className="h-3 w-3" />
              {user.role === 'superadmin' ? 'Super Admin' : 'Pengguna'}
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.06)] rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          {[
            { icon: Flame, label: 'Streak',  value: `${user.streak_days}`,                    unit: 'hari',  color: 'text-orange-400' },
            { icon: Zap,   label: 'Poin',    value: user.points.toLocaleString('id'),          unit: 'poin',  color: 'text-yellow-400' },
            { icon: Star,  label: 'Status',  value: TIER_LABELS[tier] ?? tier,                unit: '',      color: getTierColor(tier) },
          ].map(({ icon: Icon, label, value, unit, color }) => (
            <div key={label} className="flex flex-col items-center py-4 px-2 text-center">
              <Icon className={cn('h-4 w-4 mb-1', color)} />
              <p className="text-base font-black text-[#f1f5f9] leading-tight">{value}</p>
              {unit && <p className="text-[10px] text-[#475569]">{unit}</p>}
              <p className="text-[10px] text-[#64748b] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Target kampus */}
      {user.kampusTargets && user.kampusTargets.length > 0 && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
              <Target className="h-4 w-4 text-[#6366f1]" /> Target Kampus
            </h3>
            <Link href="/onboarding" className="text-xs text-[#6366f1] hover:underline">Ubah</Link>
          </div>
          <div className="space-y-2.5">
            {[...user.kampusTargets]
              .sort((a, b) => a.priority - b.priority)
              .map((t, i) => (
                <div key={t.kampus.id} className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-black text-white">
                    {i + 1}
                  </div>
                  <KampusLogo kampus={t.kampus} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#f1f5f9]">{t.kampus.akronim}</p>
                    <p className="truncate text-xs text-[#64748b]">{t.jurusan.nama}</p>
                  </div>
                  {t.jurusan.passing_grade_estimate && (
                    <span className="shrink-0 text-xs font-bold text-[#10b981]">
                      {Number(t.jurusan.passing_grade_estimate).toFixed(1)}%
                    </span>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Upgrade CTA for free users */}
      {tier === 'free' && (
        <Card className="border-[rgba(139,92,246,0.3)] bg-gradient-to-br from-[rgba(99,102,241,0.08)] to-[rgba(139,92,246,0.04)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#f1f5f9]">Upgrade ke Premium</h3>
              <p className="mt-1 text-sm text-[#64748b]">
                Soal tak terbatas, Tanya AI 30x/hari, Foto Soal 10x/hari, dan analisis kelemahan lengkap.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {['Soal unlimited', 'Tanya AI 30x/hari', 'Foto Soal 10x/hari', 'Analisis lengkap'].map(f => (
                  <span key={f} className="flex items-center gap-1 text-xs text-[#a5b4fc]">
                    <CheckCircle2 className="h-3 w-3" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/payment">
              <Button variant="gradient" size="md" className="w-full">
                Upgrade Sekarang — Rp49.000/bulan <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}


      {/* Account settings */}
      <Card>
        <h3 className="mb-3 font-semibold text-[#f1f5f9]">Pengaturan Akun</h3>
        <div className="space-y-1">
          {[
            { href: '/onboarding',      label: 'Ubah Target Kampus', icon: Target  },
            { href: '/forgot-password', label: 'Ganti Password',     icon: Shield  },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-xl p-3 hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(99,102,241,0.1)]">
                  <Icon className="h-4 w-4 text-[#6366f1]" />
                </div>
                <span className="text-sm text-[#94a3b8]">{label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#334155] group-hover:text-[#6366f1] transition-colors" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
