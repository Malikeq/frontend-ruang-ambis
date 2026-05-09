'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { KampusLogo } from '@/components/shared/KampusLogo';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, RefreshCw, Image, CheckCircle2, XCircle, Zap } from 'lucide-react';

const LOGO_TOKEN = 'pk_a1dih9BDRCmE0bDH9EgSUg';

export default function AdminKampusPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [noLogoOnly, setNoLogoOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-kampus', search, noLogoOnly, page],
    queryFn: () => adminApi.kampus({ search, no_logo: noLogoOnly ? 'true' : undefined, page }),
    staleTime: 30_000,
  });

  const kampusList: any[] = data?.data?.data?.data ?? [];
  const meta = data?.data?.data?.meta ?? { current_page: 1, last_page: 1, total: 0 };
  const stats = data?.data?.stats ?? { total: 0, with_logo: 0 };

  const fetchOneMut = useMutation({
    mutationFn: (id: number) => adminApi.fetchKampusLogo(id),
    onSuccess: (res) => {
      const msg = res.data?.message ?? 'Selesai!';
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ['admin-kampus'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Tidak ada logo ditemukan.'),
  });

  const fetchAllMut = useMutation({
    mutationFn: () => adminApi.fetchAllLogos({ limit: 200 }),
    onSuccess: (res) => toast.info(res.data?.message ?? 'Proses dimulai di background!'),
    onError: () => toast.error('Gagal memulai proses fetch.'),
  });

  const logoPercent = stats.total > 0
    ? Math.round((stats.with_logo / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="🖼️ Logo Kampus"
          description="Kelola logo universitas dari logo.dev"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => fetchAllMut.mutate()}
                isLoading={fetchAllMut.isPending}
              >
                <Zap className="h-4 w-4" /> Fetch Semua Logo
              </Button>
            </div>
          }
        />

        {/* Stats bar */}
        <Card>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[#64748b]">Logo Coverage</p>
                <p className="text-xs font-bold text-[#f1f5f9]">
                  {stats.with_logo} / {stats.total} ({logoPercent}%)
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#10b981] transition-all duration-700"
                  style={{ width: `${logoPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm shrink-0">
              <div className="flex items-center gap-1.5 text-[#10b981]">
                <CheckCircle2 className="h-4 w-4" />
                {stats.with_logo} ada logo
              </div>
              <div className="flex items-center gap-1.5 text-[#ef4444]">
                <XCircle className="h-4 w-4" />
                {stats.total - stats.with_logo} belum
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama atau akronim kampus..."
              className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-2.5 pl-9 pr-4 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
            />
          </div>
          <button
            onClick={() => { setNoLogoOnly(!noLogoOnly); setPage(1); }}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
              noLogoOnly
                ? 'border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.1)] text-[#a5b4fc]'
                : 'border-[rgba(255,255,255,0.08)] text-[#64748b] hover:text-[#94a3b8]',
            )}
          >
            <Image className="h-4 w-4" />
            Hanya yang belum ada logo
          </button>
        </Card>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1,2,3,4,5,6,7,8].map(i => <Card key={i}><Skeleton className="h-20" /></Card>)}
          </div>
        ) : kampusList.length === 0 ? (
          <Card className="py-16 text-center">
            <Image className="h-10 w-10 text-[#334155] mx-auto mb-3" />
            <p className="font-semibold text-[#f1f5f9]">Tidak ada kampus ditemukan</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kampusList.map((k: any) => (
              <Card key={k.id} className="group flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {/* Live logo preview */}
                  <KampusLogo kampus={k} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-[#f1f5f9]">{k.akronim}</p>
                    <p className="truncate text-xs text-[#64748b]">{k.kota}</p>
                  </div>
                  {k.logo_url ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10b981]" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-[#ef4444]" />
                  )}
                </div>

                <p className="text-xs text-[#475569] line-clamp-1">{k.nama}</p>

                {/* Logo URL preview if exists */}
                {k.logo_url && (
                  <a
                    href={k.logo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[10px] text-[#6366f1] hover:underline"
                  >
                    {k.logo_url.replace('https://img.logo.dev/', '').split('?')[0]}
                  </a>
                )}

                <Button
                  variant={k.logo_url ? 'secondary' : 'gradient'}
                  size="sm"
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => fetchOneMut.mutate(k.id)}
                  isLoading={fetchOneMut.isPending}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {k.logo_url ? 'Re-fetch Logo' : 'Cari Logo'}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#475569]">Hal {meta.current_page}/{meta.last_page}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <Button variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          </div>
        )}

        {/* Usage notes */}
        <Card className="border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.04)]">
          <h3 className="text-sm font-semibold text-[#a5b4fc] mb-2">📖 Cara Kerja Logo.dev</h3>
          <div className="space-y-1.5 text-xs text-[#64748b]">
            <p>• Logo diambil dari <code className="text-[#a5b4fc]">img.logo.dev/{'<nama>'}?token={LOGO_TOKEN}</code></p>
            <p>• Sistem mencoba: nama penuh → terjemahan Inggris → akronim → nama tanpa prefix</p>
            <p>• Logo &lt;1500 byte dianggap placeholder dan dilewati</p>
            <p>• <strong className="text-[#f1f5f9]">Klik "Fetch Semua Logo"</strong> untuk memproses semua kampus di background</p>
            <p>• Artisan: <code className="text-[#a5b4fc]">php artisan kampus:fetch-logos --limit=100 --dry-run</code></p>
          </div>
        </Card>
      </div>
  );
}
