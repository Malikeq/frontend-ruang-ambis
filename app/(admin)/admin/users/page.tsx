'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, getInitials, getTierColor, formatDate } from '@/lib/utils';
import { TIER_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { Search, Ban, Crown, RefreshCw, User } from 'lucide-react';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-users-full', search, page],
    queryFn: () => adminApi.users({ search, page, per_page: 20 }),
    staleTime: 30_000,
  });

  const users: any[] = data?.data?.data?.data ?? [];
  const meta = data?.data?.data?.meta ?? { current_page: 1, last_page: 1, total: 0 };

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
          description={`${meta.total.toLocaleString('id')} pengguna terdaftar`}
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
                  <div key={u.id} className="flex items-center gap-4 px-5 py-4">
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
                      <p className="text-[10px] text-[#475569] mt-0.5">
                        Bergabung: {formatDate(u.created_at)} · {u.streak_days} hari streak · {u.points} poin
                      </p>
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

                    {/* Ban/Unban */}
                    {!u.is_banned ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Ban ${u.name}?`)) banMut.mutate(u.id);
                        }}
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
                ))}
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-5 py-3">
                  <p className="text-xs text-[#475569]">Hal {meta.current_page}/{meta.last_page}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                    <Button variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next →</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
  );
}
