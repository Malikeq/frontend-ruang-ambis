'use client';

import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { cn, getInitials, getTierColor } from '@/lib/utils';
import { Trophy, Flame, Zap, Crown, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user: { id: number; name: string; avatar_url?: string; tier: string };
  points: number;
  streak_days: number;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold t-muted">#{rank}</span>;
}

function rankCardStyle(rank: number): React.CSSProperties {
  if (rank === 1) return { borderColor: 'rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.06)' };
  if (rank === 2) return { borderColor: 'rgba(148,163,184,0.3)', backgroundColor: 'rgba(148,163,184,0.04)' };
  if (rank === 3) return { borderColor: 'rgba(180,83,9,0.3)', backgroundColor: 'rgba(180,83,9,0.06)' };
  return {};
}

export default function LeaderboardPage() {
  const { user: me } = useAuthStore();

  const { data: listData, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardApi.getAll(),
    staleTime: 30_000,
  });

  const { data: myRankData } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => leaderboardApi.myRank(),
    staleTime: 30_000,
  });

  const entries: LeaderboardEntry[] = listData?.data?.data ?? [];
  const myRank = myRankData?.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏆 Leaderboard Nasional"
        description="Top 100 pejuang SNBT berdasarkan total poin"
      />

      {/* My rank card */}
      {myRank && (
        <Card style={{ borderColor: 'var(--primary-border)', background: 'linear-gradient(135deg, var(--primary-muted), var(--bg-elevated))' }}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
              {getInitials(me?.name ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold t-primary">{me?.name}</p>
              <p className={cn('text-xs font-medium capitalize', getTierColor(me?.tier ?? 'free'))}>
                {me?.tier === 'daily_pass' ? 'Daily Pass' : me?.tier}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>#{myRank.rank}</p>
              <p className="text-xs t-muted">{myRank.points.toLocaleString('id')} poin</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs t-muted">
            <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" />{myRank.streak_days} hari streak</span>
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-yellow-400" />{myRank.points.toLocaleString('id')} poin</span>
          </div>
        </Card>
      )}

      {/* Leaderboard list */}
      <Card className="p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="w-10 text-xs font-semibold uppercase tracking-wider t-muted">Rank</span>
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider t-muted">Pengguna</span>
          <span className="w-20 text-right text-xs font-semibold uppercase tracking-wider t-muted">Poin</span>
          <span className="w-16 text-right text-xs font-semibold uppercase tracking-wider t-muted">Streak</span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Trophy className="h-12 w-12 t-muted mb-3" />
            <p className="font-semibold t-primary">Jadilah yang Pertama!</p>
            <p className="mt-1 text-sm t-muted">Belum ada pengguna di leaderboard. Mulai latihan untuk masuk daftar!</p>
          </div>
        ) : (
          <div>
            {entries.map((e) => {
              const isMe = e.user.id === me?.id;
              return (
                <div
                  key={e.rank}
                  className="flex items-center gap-4 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: isMe ? 'var(--primary-muted)' : undefined,
                    ...rankCardStyle(e.rank),
                  }}
                >
                  {/* Rank */}
                  <div className="flex w-10 items-center justify-center shrink-0">
                    <RankIcon rank={e.rank} />
                  </div>

                  {/* User */}
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                      e.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                      : e.rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                      : e.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-800'
                      : 'bg-gradient-to-br from-sky-500 to-sky-600',
                    )}>
                      {getInitials(e.user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-semibold', isMe ? 'text-primary' : 't-primary')}>
                        {e.user.name}{isMe && ' (Kamu)'}
                      </p>
                      <p className={cn('text-xs font-medium capitalize', getTierColor(e.user.tier))}>
                        {e.user.tier === 'daily_pass' ? 'Daily Pass' : e.user.tier}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="w-20 text-right shrink-0">
                    <p className="text-sm font-bold t-primary">{e.points.toLocaleString('id')}</p>
                    <p className="text-[10px] t-muted">poin</p>
                  </div>

                  {/* Streak */}
                  <div className="w-16 text-right shrink-0">
                    <p className="flex items-center justify-end gap-1 text-sm font-semibold t-primary">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />{e.streak_days}
                    </p>
                    <p className="text-[10px] t-muted">hari</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Info card */}
      <Card className="text-center py-4" style={{ borderColor: 'var(--primary-border)', backgroundColor: 'var(--primary-muted)' }}>
        <p className="text-xs t-muted">
          🏆 Poin didapat dari menjawab soal benar (+10) dan menyelesaikan sesi latihan (+15).
          Leaderboard diperbarui secara real-time.
        </p>
      </Card>
    </div>
  );
}
