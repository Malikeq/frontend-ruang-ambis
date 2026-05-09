'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatRupiah, formatDateTime, getInitials } from '@/lib/utils';
import { DollarSign, RefreshCw, TrendingUp, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  settlement: { label: 'Berhasil',   variant: 'success' },
  capture:    { label: 'Berhasil',   variant: 'success' },
  pending:    { label: 'Pending',    variant: 'warning' },
  expire:     { label: 'Kadaluarsa', variant: 'error'   },
  cancel:     { label: 'Dibatalkan', variant: 'error'   },
  refund:     { label: 'Refund',     variant: 'warning' },
};

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-transactions', page],
    queryFn: () => adminApi.dashboard(),   // transactions endpoint returns within dashboard for now
    staleTime: 30_000,
  });

  // Revenue summary
  const { data: revData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => adminApi.revenue(),
    staleTime: 60_000,
  });

  const rev = revData?.data?.data ?? {};
  const transactions: any[] = data?.data?.data?.recent_transactions ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="💰 Transaksi"
          description="Riwayat pembayaran dan revenue platform"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          }
        />

        {/* Revenue summary tiles */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: DollarSign, label: 'Revenue Bulan Ini',  value: formatRupiah(rev.bulan_ini ?? 0),   color: 'text-[#10b981]', bg: 'bg-[rgba(16,185,129,0.1)]'  },
            { icon: TrendingUp, label: 'Revenue Total',      value: formatRupiah(rev.total ?? 0),        color: 'text-[#6366f1]', bg: 'bg-[rgba(99,102,241,0.1)]'  },
            { icon: Users,      label: 'Total Subscriber',   value: (rev.total_subscribers ?? 0).toLocaleString('id'), color: 'text-[#f59e0b]', bg: 'bg-[rgba(245,158,11,0.1)]' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b]">{label}</p>
                  <p className="mt-1.5 text-2xl font-black text-[#f1f5f9]">{value}</p>
                </div>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Transaction table */}
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
            <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
              <Package className="h-4 w-4 text-[#6366f1]" /> Riwayat Transaksi
            </h2>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <DollarSign className="h-10 w-10 text-[#334155] mb-3" />
              <p className="font-semibold text-[#f1f5f9]">Belum ada transaksi</p>
              <p className="text-sm text-[#64748b] mt-1">Transaksi akan muncul di sini setelah pengguna melakukan pembayaran.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)]">
                      {['Order ID', 'Pengguna', 'Paket', 'Nominal', 'Status', 'Tanggal'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#475569]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {transactions.map((t: any) => {
                      const sc = STATUS_CONFIG[t.status] ?? { label: t.status, variant: 'default' };
                      return (
                        <tr key={t.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs text-[#94a3b8]">{t.order_id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-[10px] font-bold text-white">
                                {getInitials(t.user?.name ?? '?')}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm text-[#f1f5f9]">{t.user?.name ?? '–'}</p>
                                <p className="truncate text-xs text-[#475569]">{t.user?.email ?? ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#94a3b8]">{t.package?.nama ?? '–'}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-[#f1f5f9]">{formatRupiah(t.amount ?? 0)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#64748b]">
                            {t.created_at ? formatDateTime(t.created_at) : '–'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>
  );
}
