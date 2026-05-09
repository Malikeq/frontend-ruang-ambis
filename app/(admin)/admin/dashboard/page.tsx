'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Users, BookOpen, Zap, TrendingUp, DollarSign,
  CheckCircle, XCircle, Eye, Ban, Crown, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────
interface AdminStats {
  total_users: number;
  total_premium: number;
  total_soal_published: number;
  total_soal_ai: number;
  revenue_bulan_ini: number;
  active_sessions_today: number;
  pending_drafts: number;
  ai_cost_bulan_ini: number;
}

// ── Stat tile ─────────────────────────────────────────────
function Tile({
  icon: Icon, label, value, sub, color = 'text-[#6366f1]', bg = 'bg-[rgba(99,102,241,0.1)]',
}: { icon: any; label: string; value: string | number; sub?: string; color?: string; bg?: string }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#64748b]">{label}</p>
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

// ── Draft soal review section ──────────────────────────────
function DraftReview() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-drafts'],
    queryFn: () => adminApi.drafts({ status: 'pending', per_page: 10 }),
    staleTime: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveDraft(id),
    onSuccess: () => { toast.success('Draft diapprove!'); qc.invalidateQueries({ queryKey: ['admin-drafts'] }); },
    onError: () => toast.error('Gagal approve draft.'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectDraft(id),
    onSuccess: () => { toast.success('Draft ditolak.'); qc.invalidateQueries({ queryKey: ['admin-drafts'] }); },
    onError: () => toast.error('Gagal reject draft.'),
  });

  const drafts = data?.data?.data?.data ?? [];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#6366f1]" /> Draft Soal AI — Review
        </h2>
        <Link href="/admin/ai-drafts">
          <Button variant="ghost" size="sm">Lihat semua</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle className="h-10 w-10 text-[#10b981] mb-2" />
          <p className="text-sm font-semibold text-[#f1f5f9]">Semua draft sudah direview!</p>
          <p className="text-xs text-[#64748b] mt-1">Upload materi baru untuk generate soal lebih banyak.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.slice(0, 5).map((d: any) => (
            <div key={d.id} className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-sm text-[#f1f5f9] line-clamp-2 mb-3">
                {d.draft?.pertanyaan ?? 'Draft soal'}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {d.draft?.mapel && (
                    <span className="rounded bg-[rgba(99,102,241,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#a5b4fc]">
                      {d.draft.mapel}
                    </span>
                  )}
                  {d.draft?.tingkat_kesulitan && (
                    <span className="rounded bg-[rgba(245,158,11,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#fbbf24] capitalize">
                      {d.draft.tingkat_kesulitan}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => rejectMutation.mutate(d.id)}
                    isLoading={rejectMutation.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Tolak
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => approveMutation.mutate(d.id)}
                    isLoading={approveMutation.isPending}
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Recent users section ───────────────────────────────────
function RecentUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.users({ per_page: 8, sort: 'latest' }),
    staleTime: 30_000,
  });

  const qc = useQueryClient();
  const banMutation = useMutation({
    mutationFn: (id: number) => adminApi.banUser(id),
    onSuccess: () => { toast.success('User dibanned.'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  const users: any[] = data?.data?.data?.data ?? [];

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
        <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
          <Users className="h-4 w-4 text-[#6366f1]" /> Pengguna Terbaru
        </h2>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">Kelola semua</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10" />)}</div>
      ) : users.length === 0 ? (
        <div className="py-10 text-center text-sm text-[#64748b]">Belum ada pengguna.</div>
      ) : (
        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
          {users.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-bold text-white">
                {u.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[#f1f5f9]">{u.name}</p>
                <p className="truncate text-xs text-[#64748b]">{u.email}</p>
              </div>
              <Badge variant={u.tier === 'premium' ? 'premium' : u.tier === 'daily_pass' ? 'default' : 'free'}>
                {u.tier}
              </Badge>
              {!u.is_banned && (
                <button
                  onClick={() => banMutation.mutate(u.id)}
                  className="ml-1 rounded p-1 text-[#475569] hover:bg-[rgba(239,68,68,0.1)] hover:text-red-400 transition-colors"
                  title="Ban user"
                >
                  <Ban className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Main admin dashboard ───────────────────────────────────
export default function AdminDashboardPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
    staleTime: 60_000,
  });

  // Normalise the data path — backend wraps as { success, data: { ... } }
  // and axios wraps as res.data — so the chain is: queryData.data.data
  const raw = data?.data?.data;
  const stats: AdminStats | null = raw && typeof raw === 'object' && 'total_users' in raw
    ? (raw as AdminStats)
    : null;

  const tiles = stats
    ? [
        {
          icon: Users,      label: 'Total Pengguna',
          value: (stats.total_users ?? 0).toLocaleString('id'),
          sub:   `${stats.total_premium ?? 0} premium`,
          color: 'text-[#6366f1]',  bg: 'bg-[rgba(99,102,241,0.1)]',
        },
        {
          icon: BookOpen,   label: 'Soal Published',
          value: (stats.total_soal_published ?? 0).toLocaleString('id'),
          sub:   `${stats.total_soal_ai ?? 0} dari AI`,
          color: 'text-[#10b981]',  bg: 'bg-[rgba(16,185,129,0.1)]',
        },
        {
          icon: Zap,        label: 'Draft Pending',
          value: stats.pending_drafts ?? 0,
          sub:   'perlu direview',
          color: 'text-[#f59e0b]',  bg: 'bg-[rgba(245,158,11,0.1)]',
        },
        {
          icon: DollarSign, label: 'Revenue Bulan Ini',
          value: formatRupiah(stats.revenue_bulan_ini ?? 0),
          sub:   `AI cost: ${formatRupiah(stats.ai_cost_bulan_ini ?? 0)}`,
          color: 'text-[#10b981]',  bg: 'bg-[rgba(16,185,129,0.1)]',
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="🛠️ Admin Dashboard"
          description="Monitor platform, review soal AI, dan kelola pengguna"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          }
        />

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/admin/ai-upload',   label: '📤 Upload Materi AI' },
            { href: '/admin/ai-drafts',   label: '✅ Review Drafts' },
            { href: '/admin/soal',        label: '📚 Bank Soal' },
            { href: '/admin/users',       label: '👥 Pengguna' },
            { href: '/admin/packages',    label: '💳 Paket & Harga' },
            { href: '/admin/transactions',label: '💰 Transaksi' },
            { href: '/admin/kampus',      label: '🖼️ Logo Kampus' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}>
              <Button variant="secondary" size="sm">{label}</Button>
            </Link>
          ))}

        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <Card key={i}><Skeleton className="h-20" /></Card>)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map(t => <Tile key={t.label} {...t} />)}
          </div>
        )}

        {/* Two-column content */}
        <div className="grid gap-4 lg:grid-cols-2">
          <DraftReview />
          <RecentUsers />
        </div>
      </div>
  );
}
