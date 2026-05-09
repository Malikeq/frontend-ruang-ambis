'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, getMapelColor, getDifficultyColor } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash2, Eye, EyeOff, Search, Filter, RefreshCw, Sparkles } from 'lucide-react';

export default function AdminSoalPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterMapel, setFilterMapel] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-soal', search, filterMapel, page],
    queryFn: () => adminApi.soal({ search, mapel: filterMapel, page, per_page: 20 }),
    staleTime: 30_000,
  });

  const soals: any[] = data?.data?.data?.data ?? [];
  const meta = data?.data?.data?.meta ?? { current_page: 1, last_page: 1, total: 0 };

  const publishMut = useMutation({
    mutationFn: (id: number) => adminApi.publishSoal(id),
    onSuccess: () => { toast.success('Status diubah!'); qc.invalidateQueries({ queryKey: ['admin-soal'] }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteSoal(id),
    onSuccess: () => { toast.success('Soal dihapus.'); qc.invalidateQueries({ queryKey: ['admin-soal'] }); },
    onError:   () => toast.error('Gagal menghapus soal.'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="📚 Bank Soal"
          description={`Total ${meta.total.toLocaleString('id')} soal di database`}
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          }
        />

        {/* Filters */}
        <Card className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari soal..."
              className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-2.5 pl-9 pr-4 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
            />
          </div>
          <select
            value={filterMapel}
            onChange={e => { setFilterMapel(e.target.value); setPage(1); }}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141428] px-3 py-2.5 text-sm text-[#94a3b8] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
          >
            <option value="">Semua Mapel</option>
            {['PU','PM','LBI','LBE','KMBM','PK','PPU'].map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </Card>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : soals.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-semibold text-[#f1f5f9]">Tidak ada soal ditemukan</p>
              <p className="text-sm text-[#64748b] mt-1">Coba ubah filter atau upload materi AI terlebih dahulu.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)]">
                      {['ID', 'Soal', 'Mapel', 'Kesulitan', 'Source', 'Status', 'Aksi'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#475569]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {soals.map((s: any) => (
                      <tr key={s.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-4 py-3 text-xs text-[#475569]">#{s.id}</td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-sm text-[#f1f5f9] line-clamp-2">{s.konten}</p>
                          {s.sub_materi?.nama && (
                            <p className="text-xs text-[#475569] mt-0.5">{s.sub_materi.nama}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded px-2 py-0.5 text-xs font-bold', getMapelColor(s.mapel?.kode ?? ''))}>
                            {s.mapel?.kode ?? '–'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-semibold capitalize', getDifficultyColor(s.tingkat_kesulitan))}>
                            {s.tingkat_kesulitan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.is_ai_generated ? (
                            <span className="flex items-center gap-1 text-xs text-[#a5b4fc]">
                              <Sparkles className="h-3 w-3" /> AI
                            </span>
                          ) : (
                            <span className="text-xs text-[#475569]">Manual</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={s.is_published ? 'success' : 'warning'}>
                            {s.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => publishMut.mutate(s.id)}
                              title={s.is_published ? 'Unpublish' : 'Publish'}
                              className={cn(
                                'rounded p-1.5 transition-colors',
                                s.is_published
                                  ? 'text-[#10b981] hover:bg-[rgba(16,185,129,0.1)]'
                                  : 'text-[#64748b] hover:bg-[rgba(99,102,241,0.1)] hover:text-[#6366f1]',
                              )}
                            >
                              {s.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus soal #${s.id}?`)) deleteMut.mutate(s.id);
                              }}
                              className="rounded p-1.5 text-[#475569] hover:bg-[rgba(239,68,68,0.1)] hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-4 py-3">
                  <p className="text-xs text-[#475569]">
                    Hal {meta.current_page} dari {meta.last_page} ({meta.total} soal)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      ← Prev
                    </Button>
                    <Button variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
                      Next →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
  );
}
