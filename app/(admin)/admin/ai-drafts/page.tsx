'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

function DraftCard({ draft: d }: { draft: any }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const approveMut = useMutation({
    mutationFn: () => adminApi.approveDraft(d.id),
    onSuccess: () => { toast.success('Draft diapprove → masuk bank soal!'); qc.invalidateQueries({ queryKey: ['admin-drafts-full'] }); },
    onError:   () => toast.error('Gagal approve.'),
  });
  const rejectMut = useMutation({
    mutationFn: () => adminApi.rejectDraft(d.id),
    onSuccess: () => { toast.success('Draft ditolak.'); qc.invalidateQueries({ queryKey: ['admin-drafts-full'] }); },
    onError:   () => toast.error('Gagal reject.'),
  });

  const data = d.draft ?? {};
  const pilijhan: Record<string, string> = data.pilihan ?? {};
  const kunci: string = data.kunci ?? '';

  return (
    <Card className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {data.mapel && (
            <span className="rounded bg-[rgba(99,102,241,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#a5b4fc]">
              {data.mapel}
            </span>
          )}
          {data.sub_materi && (
            <span className="rounded bg-[rgba(255,255,255,0.07)] px-2 py-0.5 text-[10px] text-[#64748b]">
              {data.sub_materi}
            </span>
          )}
          {data.tingkat_kesulitan && (
            <span className={cn(
              'rounded px-2 py-0.5 text-[10px] font-semibold capitalize',
              data.tingkat_kesulitan === 'mudah' ? 'bg-green-500/15 text-green-400'
                : data.tingkat_kesulitan === 'sulit' ? 'bg-red-500/15 text-red-400'
                : 'bg-yellow-500/15 text-yellow-400',
            )}>
              {data.tingkat_kesulitan}
            </span>
          )}
        </div>
        <Badge variant={d.status === 'pending' ? 'warning' : d.status === 'approved' ? 'success' : 'error'}>
          {d.status}
        </Badge>
      </div>

      {/* Question */}
      <p className="text-sm text-[#f1f5f9] leading-relaxed whitespace-pre-line">
        {data.pertanyaan ?? '–'}
      </p>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1 text-xs text-[#6366f1] hover:underline"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Sembunyikan' : 'Lihat pilihan & pembahasan'}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-3">
          {/* Choices */}
          <div className="space-y-1.5">
            {Object.entries(pilijhan).map(([label, text]) => (
              <div
                key={label}
                className={cn(
                  'flex gap-2 rounded-lg border p-2.5 text-sm',
                  label === kunci
                    ? 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.08)] text-[#34d399]'
                    : 'border-[rgba(255,255,255,0.06)] text-[#94a3b8]',
                )}
              >
                <span className="font-bold shrink-0">{label}.</span>
                <span>{text}</span>
                {label === kunci && <CheckCircle className="h-4 w-4 shrink-0 ml-auto text-[#10b981]" />}
              </div>
            ))}
          </div>

          {/* Explanation */}
          {data.pembahasan && (
            <div className="rounded-lg bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.15)] p-3">
              <p className="text-xs font-semibold text-[#a5b4fc] mb-1">Pembahasan:</p>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{data.pembahasan}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {d.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => rejectMut.mutate()}
            isLoading={rejectMut.isPending}
          >
            <XCircle className="h-3.5 w-3.5" /> Tolak
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="flex-1"
            onClick={() => approveMut.mutate()}
            isLoading={approveMut.isPending}
          >
            <CheckCircle className="h-3.5 w-3.5" /> Approve & Publish
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function AdminAiDraftsPage() {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-drafts-full', filter],
    queryFn: () => adminApi.drafts({ status: filter, per_page: 30 }),
    staleTime: 30_000,
  });

  const drafts: any[] = data?.data?.data?.data ?? [];

  const tabs: Array<{ key: typeof filter; label: string }> = [
    { key: 'pending',  label: '⏳ Pending' },
    { key: 'approved', label: '✅ Approved' },
    { key: 'rejected', label: '❌ Ditolak' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="✅ Review Soal AI"
          description="Periksa dan approve soal hasil generate AI sebelum dipublikasi ke bank soal"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          }
        />

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                filter === key
                  ? 'bg-[rgba(99,102,241,0.2)] text-[#a5b4fc] border border-[rgba(99,102,241,0.3)]'
                  : 'text-[#64748b] hover:text-[#94a3b8]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Draft list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Card key={i}><Skeleton className="h-32" /></Card>)}
          </div>
        ) : drafts.length === 0 ? (
          <Card className="py-16 text-center">
            <div className="text-5xl mb-3">
              {filter === 'pending' ? '🎉' : filter === 'approved' ? '📚' : '🗑️'}
            </div>
            <p className="font-semibold text-[#f1f5f9]">
              {filter === 'pending'
                ? 'Tidak ada draft pending!'
                : filter === 'approved'
                ? 'Belum ada soal yang diapprove'
                : 'Tidak ada draft yang ditolak'}
            </p>
            <p className="text-sm text-[#64748b] mt-1">
              {filter === 'pending' ? 'Upload materi baru untuk generate soal.' : ''}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#64748b]">{drafts.length} draft ditemukan</p>
            {drafts.map(d => <DraftCard key={d.id} draft={d} />)}
          </div>
        )}
      </div>
  );
}
