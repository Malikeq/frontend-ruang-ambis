'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, getInitials, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, Ban, RefreshCw, User, ChevronDown, ChevronUp, Flame, RotateCcw, FastForward, Zap } from 'lucide-react';

// ── Streak Test Panel (per user) ─────────────────────────────────────────────
function StreakTestPanel({ user, onDone }: { user: any; onDone: () => void }) {
  const [customStreak, setCustomStreak] = useState('');
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-users-full'] });
    onDone();
  };

  const simulateMut = useMutation({
    mutationFn: (days: number) => adminApi.simulateDay(user.id, days),
    onSuccess: (res: any) => {
      toast.success(res.data?.message ?? 'last_active dimundurkan!');
      invalidate();
    },
    onError: () => toast.error('Gagal simulasi hari'),
  });

  const resetMut = useMutation({
    mutationFn: () => adminApi.resetStreak(user.id),
    onSuccess: () => { toast.success('Streak direset ke 0 ✅'); invalidate(); },
    onError: () => toast.error('Gagal reset streak'),
  });

  const setMut = useMutation({
    mutationFn: (n: number) => adminApi.setStreak(user.id, n),
    onSuccess: (res: any) => { toast.success(res.data?.message ?? 'Streak diset!'); invalidate(); },
    onError: () => toast.error('Gagal set streak'),
  });

  const isLoading = simulateMut.isPending || resetMut.isPending || setMut.isPending;

  return (
    <div className="mx-5 mb-4 rounded-xl border border-[rgba(251,146,60,0.25)] bg-[rgba(251,146,60,0.04)] p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-4 w-4 text-orange-400" />
        <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Streak Testing</p>
        <span className="ml-auto rounded-full bg-[rgba(251,146,60,0.15)] px-2 py-0.5 text-[10px] font-bold text-orange-300">
          Streak saat ini: {user.streak_days} 🔥
        </span>
      </div>

      {/* last_active info */}
      <p className="text-[10px] text-[#64748b] mb-3">
        last_active: <span className="text-[#94a3b8]">{user.last_active ? formatDate(user.last_active) : 'belum pernah'}</span>
        {' '}· Cara kerja: mundurkan last_active → latihan berikutnya trigger streak update
      </p>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Simulate +1 hari → streak naik besok */}
        <button
          onClick={() => simulateMut.mutate(1)}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] px-3 py-2 text-xs font-semibold text-green-400 hover:bg-[rgba(34,197,94,0.15)] transition-all disabled:opacity-40"
        >
          <FastForward className="h-3.5 w-3.5" />
          Maju 1 Hari (+1 streak)
        </button>

        {/* Simulate +2 hari → streak reset */}
        <button
          onClick={() => simulateMut.mutate(2)}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-xs font-semibold text-red-400 hover:bg-[rgba(239,68,68,0.15)] transition-all disabled:opacity-40"
        >
          <FastForward className="h-3.5 w-3.5" />
          Maju 2 Hari (reset streak)
        </button>

        {/* Set streak ke milestone */}
        {[7, 14, 30, 50, 100].map(n => (
          <button
            key={n}
            onClick={() => setMut.mutate(n)}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(251,146,60,0.3)] bg-[rgba(251,146,60,0.06)] px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-[rgba(251,146,60,0.12)] transition-all disabled:opacity-40"
          >
            <Zap className="h-3 w-3" />
            Set {n} 🔥
          </button>
        ))}

        {/* Reset */}
        <button
          onClick={() => { if (confirm(`Reset streak ${user.name} ke 0?`)) resetMut.mutate(); }}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(100,116,139,0.3)] bg-[rgba(100,116,139,0.06)] px-3 py-2 text-xs font-semibold text-[#94a3b8] hover:bg-[rgba(100,116,139,0.12)] transition-all disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          Reset ke 0
        </button>
      </div>

      {/* Custom Streak Input */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min={0}
          max={9999}
          value={customStreak}
          onChange={e => setCustomStreak(e.target.value)}
          placeholder="Custom nilai streak..."
          className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-orange-500/50 transition-all"
        />
        <button
          onClick={() => {
            const n = parseInt(customStreak);
            if (isNaN(n) || n < 0) { toast.error('Masukkan angka valid'); return; }
            setMut.mutate(n);
            setCustomStreak('');
          }}
          disabled={isLoading || !customStreak}
          className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-40"
        >
          Set
        </button>
      </div>

      {/* Flow Guide */}
      <div className="mt-3 rounded-lg bg-[rgba(255,255,255,0.03)] p-2.5 border border-[rgba(255,255,255,0.06)]">
        <p className="text-[10px] font-semibold text-[#64748b] mb-1">📋 Cara Testing Flow Streak:</p>
        <ol className="text-[10px] text-[#475569] space-y-0.5 list-decimal list-inside">
          <li>Klik <span className="text-green-400 font-semibold">&quot;Maju 1 Hari&quot;</span> → login sebagai user → latihan → streak naik +1</li>
          <li>Ulangi untuk lihat milestone badge (7, 14, 30 hari)</li>
          <li>Klik <span className="text-red-400 font-semibold">&quot;Maju 2 Hari&quot;</span> → latihan → streak RESET ke 1</li>
          <li>Atau langsung <span className="text-orange-300 font-semibold">&quot;Set 7&quot;</span> untuk test tampilan visual milestone</li>
        </ol>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedStreak, setExpandedStreak] = useState<number | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-users-full', search, page],
    queryFn: () => adminApi.users({ search, page, per_page: 20 }),
    staleTime: 30_000,
  });

  const users: any[] = data?.data?.data?.data ?? [];
  const meta = data?.data?.data ?? { current_page: 1, last_page: 1, total: 0 };

  const banMut = useMutation({
    mutationFn: (id: number) => adminApi.banUser(id),
    onSuccess: () => { toast.success('User dibanned.'); qc.invalidateQueries({ queryKey: ['admin-users-full'] }); },
  });
  const unbanMut = useMutation({
    mutationFn: (id: number) => adminApi.unbanUser(id),
    onSuccess: () => { toast.success('User di-unban.'); qc.invalidateQueries({ queryKey: ['admin-users-full'] }); },
  });
  const tierMut = useMutation({
    mutationFn: ({ id, tier }: { id: number; tier: string }) => adminApi.updateUserTier(id, tier),
    onSuccess: () => { toast.success('Tier diubah!'); qc.invalidateQueries({ queryKey: ['admin-users-full'] }); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="👥 Manajemen Pengguna"
        description={`${(meta.total ?? 0).toLocaleString('id')} pengguna terdaftar`}
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama atau email pengguna..."
            className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-2.5 pl-9 pr-4 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
          />
        </div>
      </Card>

      {/* Streak Testing Guide Card */}
      <Card className="border-orange-500/20 bg-orange-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15">
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-400">🔥 Streak Testing Mode</p>
            <p className="mt-0.5 text-xs text-[#64748b]">
              Klik ikon <Flame className="inline h-3 w-3 text-orange-400" /> di bawah tiap user untuk membuka panel testing streak.
              Simulasikan perpindahan hari tanpa menunggu waktu nyata.
            </p>
          </div>
        </div>
      </Card>

      {/* User list */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <User className="h-10 w-10 text-[#334155] mb-3" />
            <p className="font-semibold text-[#f1f5f9]">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {users.map((u: any) => (
                <div key={u.id}>
                  {/* User row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                      u.is_banned ? 'bg-[#334155]' : 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]',
                    )}>
                      {getInitials(u.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn('text-sm font-semibold', u.is_banned ? 'text-[#64748b] line-through' : 'text-[#f1f5f9]')}>
                          {u.name}
                        </p>
                        {u.is_banned && <Badge variant="error">Banned</Badge>}
                      </div>
                      <p className="truncate text-xs text-[#64748b]">{u.email}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-[10px] text-[#475569]">
                          Bergabung: {formatDate(u.created_at)} · {u.points} poin
                        </p>
                        {/* Streak badge */}
                        <span className={cn(
                          'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold',
                          u.streak_days >= 30 ? 'bg-orange-500/20 text-orange-300' :
                          u.streak_days >= 7  ? 'bg-yellow-500/15 text-yellow-400' :
                          u.streak_days > 0   ? 'bg-[rgba(255,255,255,0.06)] text-[#64748b]' :
                                                'bg-[rgba(255,255,255,0.03)] text-[#475569]'
                        )}>
                          🔥 {u.streak_days}
                        </span>
                      </div>
                    </div>

                    {/* Tier selector */}
                    <select
                      value={u.tier}
                      onChange={e => tierMut.mutate({ id: u.id, tier: e.target.value })}
                      className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0d0d1f] px-2 py-1.5 text-xs text-[#94a3b8] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
                    >
                      <option value="free">Gratis</option>
                      <option value="daily_pass">Daily Pass</option>
                      <option value="premium">Premium</option>
                    </select>

                    {/* Streak Test Button */}
                    <button
                      onClick={() => setExpandedStreak(expandedStreak === u.id ? null : u.id)}
                      className={cn(
                        'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all',
                        expandedStreak === u.id
                          ? 'border-orange-500/50 bg-orange-500/15 text-orange-400'
                          : 'border-[rgba(251,146,60,0.2)] bg-transparent text-[#64748b] hover:border-orange-500/40 hover:text-orange-400'
                      )}
                      title="Streak Testing"
                    >
                      <Flame className="h-3.5 w-3.5" />
                      {expandedStreak === u.id
                        ? <ChevronUp className="h-3 w-3" />
                        : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {/* Ban/Unban */}
                    {!u.is_banned ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => { if (confirm(`Ban ${u.name}?`)) banMut.mutate(u.id); }}
                        isLoading={banMut.isPending}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => unbanMut.mutate(u.id)}
                        isLoading={unbanMut.isPending}
                      >
                        Unban
                      </Button>
                    )}
                  </div>

                  {/* Streak Test Panel (expandable) */}
                  {expandedStreak === u.id && (
                    <StreakTestPanel
                      user={u}
                      onDone={() => setExpandedStreak(null)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(meta.last_page ?? 1) > 1 && (
              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-5 py-3">
                <p className="text-xs text-[#475569]">Hal {meta.current_page}/{meta.last_page}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <Button variant="secondary" size="sm" disabled={page >= (meta.last_page ?? 1)} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
