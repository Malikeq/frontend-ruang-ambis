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
  if (rank === 1) return <Crown className="h-5 w-5 text-[#fbbf24]" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-[#94a3b8]" />;
  if (rank === 3) return <Award className="h-5 w-5 text-[#b45309]" />;
  return <span className="text-sm font-bold text-[#475569]">#{rank}</span>;
}

function RankBg(rank: number) {
  if (rank === 1) return 'border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.06)]';
  if (rank === 2) return 'border-[rgba(148,163,184,0.3)] bg-[rgba(148,163,184,0.04)]';
  if (rank === 3) return 'border-[rgba(180,83,9,0.3)] bg-[rgba(180,83,9,0.06)]';
  return 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]';
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
        <Card className="border-[rgba(99,102,241,0.3)] bg-gradient-to-r from-[rgba(99,102,241,0.08)] to-[rgba(139,92,246,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-sm font-black text-white">
              {getInitials(me?.name ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#f1f5f9]">{me?.name}</p>
              <p className={cn('text-xs font-medium capitalize', getTierColor(me?.tier ?? 'free'))}>
                {me?.tier === 'daily_pass' ? 'Daily Pass' : me?.tier}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-[#a5b4fc]">#{myRank.rank}</p>
              <p className="text-xs text-[#64748b]">{myRank.points.toLocaleString('id')} poin</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-[#64748b]">
            <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" />{myRank.streak_days} hari streak</span>
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-yellow-400" />{myRank.points.toLocaleString('id')} poin</span>
          </div>
        </Card>
      )}

      {/* Leaderboard list */}
      <Card className="p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
          <span className="w-10 text-xs font-semibold uppercase tracking-wider text-[#475569]">Rank</span>
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-[#475569]">Pengguna</span>
          <span className="w-20 text-right text-xs font-semibold uppercase tracking-wider text-[#475569]">Poin</span>
          <span className="w-16 text-right text-xs font-semibold uppercase tracking-wider text-[#475569]">Streak</span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Trophy className="h-12 w-12 text-[#334155] mb-3" />
            <p className="font-semibold text-[#f1f5f9]">Jadilah yang Pertama!</p>
            <p className="mt-1 text-sm text-[#64748b]">Belum ada pengguna di leaderboard. Mulai latihan untuk masuk daftar!</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {entries.map((e) => {
              const isMe = e.user.id === me?.id;
              return (
                <div
                  key={e.rank}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 transition-colors',
                    isMe ? 'bg-[rgba(99,102,241,0.08)]' : 'hover:bg-[rgba(255,255,255,0.02)]',
                  )}
                >
                  {/* Rank */}
                  <div className="flex w-10 items-center justify-center shrink-0">
                    <RankIcon rank={e.rank} />
                  </div>

                  {/* User */}
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                      e.rank === 1 ? 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]'
                      : e.rank === 2 ? 'bg-gradient-to-br from-[#94a3b8] to-[#64748b]'
                      : e.rank === 3 ? 'bg-gradient-to-br from-[#b45309] to-[#92400e]'
                      : 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]',
                    )}>
                      {getInitials(e.user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-semibold', isMe ? 'text-[#a5b4fc]' : 'text-[#f1f5f9]')}>
                        {e.user.name}{isMe && ' (Kamu)'}
                      </p>
                      <p className={cn('text-xs font-medium capitalize', getTierColor(e.user.tier))}>
                        {e.user.tier === 'daily_pass' ? 'Daily Pass' : e.user.tier}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="w-20 text-right shrink-0">
                    <p className="text-sm font-bold text-[#f1f5f9]">{e.points.toLocaleString('id')}</p>
                    <p className="text-[10px] text-[#475569]">poin</p>
                  </div>

                  {/* Streak */}
                  <div className="w-16 text-right shrink-0">
                    <p className="flex items-center justify-end gap-1 text-sm font-semibold text-[#f1f5f9]">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />{e.streak_days}
                    </p>
                    <p className="text-[10px] text-[#475569]">hari</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Info card */}
      <Card className="border-[rgba(99,102,241,0.15)] bg-[rgba(99,102,241,0.04)] text-center py-4">
        <p className="text-xs text-[#64748b]">
          🏆 Poin didapat dari menjawab soal benar (+10) dan menyelesaikan sesi latihan (+15).
          Leaderboard diperbarui secara real-time.
        </p>
      </Card>
    </div>
  );
}
