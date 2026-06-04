'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRupiah, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, RefreshCw, CheckCircle, XCircle, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

const TIER_STYLE: Record<string, { gradient: string; icon: React.ReactElement; badge: string }> = {
  premium:    {
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/30',
    icon: <Crown className="h-6 w-6 text-indigo-400" />,
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  daily_pass: {
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30',
    icon: <Zap className="h-6 w-6 text-cyan-400" />,
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
};

const GROUP_ORDER = ['AI', 'Latihan', 'Analisis', 'Lainnya'];

export default function AdminPackagesPage() {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['packages'],
    queryFn: () => adminApi.packages(),
    staleTime: 30_000,
  });
  const { data: defData } = useQuery({
    queryKey: ['features-definition'],
    queryFn: () => adminApi.featuresDefinition(),
    staleTime: Infinity,
  });

  const packages: any[] = data?.data?.data ?? [];
  const defs: any[] = defData?.data?.data ?? [];

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      adminApi.updatePackage(id, { is_active }),
    onSuccess: () => { toast.success('Status diubah.'); qc.invalidateQueries({ queryKey: ['packages'] }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deletePackage(id),
    onSuccess: () => { toast.success('Paket dinonaktifkan.'); qc.invalidateQueries({ queryKey: ['packages'] }); },
  });

  const getFeatureSummary = (fiturJson: any) => {
    if (!fiturJson || !defs.length) return { enabled: 0, total: 0 };
    const boolDefs = defs.filter(d => d.type === 'boolean');
    const enabled = boolDefs.filter(d => fiturJson[d.key] === true).length;
    return { enabled, total: boolDefs.length };
  };

  const groupedDefs = defs.reduce((acc: Record<string, any[]>, d) => {
    if (!acc[d.group]) acc[d.group] = [];
    acc[d.group].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="💳 Paket & Harga"
        description="Kelola paket langganan & konfigurasi fitur per paket"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link href="/admin/packages/buat">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Paket Baru</Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3].map(i => <Card key={i}><Skeleton className="h-80" /></Card>)}
        </div>
      ) : packages.length === 0 ? (
        <Card className="py-20 text-center">
          <p className="text-5xl mb-4">💳</p>
          <p className="font-bold text-white text-lg">Belum ada paket</p>
          <p className="text-sm text-[#64748b] mt-1 mb-6">Buat paket pertama dengan fitur yang bisa dikonfigurasi.</p>
          <Link href="/admin/packages/buat"><Button><Plus className="h-4 w-4" /> Buat Paket</Button></Link>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg: any) => {
            const style = TIER_STYLE[pkg.tier] ?? TIER_STYLE['premium'];
            const { enabled, total } = getFeatureSummary(pkg.fitur_json);
            const pct = total > 0 ? Math.round((enabled / total) * 100) : 0;

            return (
              <Card key={pkg.id}
                className={cn('bg-gradient-to-br border transition-all hover:scale-[1.01]', style.gradient, !pkg.is_active && 'opacity-60')}>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
                      {style.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{pkg.nama}</h3>
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', style.badge)}>
                        {pkg.tier === 'daily_pass' ? 'Daily Pass' : pkg.tier}
                      </span>
                    </div>
                  </div>
                  <Badge variant={pkg.is_active ? 'success' : 'warning'}>
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <p className="text-3xl font-black text-white">{formatRupiah(pkg.harga_idr)}</p>
                  <p className="text-xs text-[#64748b]">per {pkg.durasi_hari} hari</p>
                </div>

                {/* Feature progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8] font-semibold">{enabled}/{total} fitur aktif</span>
                    <span className="text-[#64748b]">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Feature grid — grouped */}
                <div className="space-y-3 mb-4">
                  {GROUP_ORDER.map(group => {
                    const groupDefs = groupedDefs[group] ?? [];
                    if (!groupDefs.length) return null;
                    return (
                      <div key={group}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1.5">{group}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {groupDefs.map((def: any) => {
                            const val = pkg.fitur_json?.[def.key];
                            const isOn = def.type === 'boolean' ? val === true : (val !== 0 && val !== false && val !== undefined);
                            const label = def.type === 'number'
                              ? `${def.icon} ${def.label.replace('Batas ', '')} ${val === -1 ? '∞' : (val ?? 0)}`
                              : `${def.icon} ${def.label}`;
                            return (
                              <div key={def.key}
                                className={cn('flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px]',
                                  isOn ? 'bg-[rgba(255,255,255,0.04)] text-[#e2e8f0]' : 'text-[#334155]')}>
                                {isOn
                                  ? <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                                  : <XCircle className="h-3 w-3 text-[#334155] flex-shrink-0" />}
                                <span className="truncate">{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <Link href={`/admin/packages/${pkg.id}/edit`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Edit2 className="h-3.5 w-3.5" /> Edit Fitur
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm"
                    onClick={() => toggleMut.mutate({ id: pkg.id, is_active: !pkg.is_active })}
                    isLoading={toggleMut.isPending}
                    title={pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                    {pkg.is_active ? <XCircle className="h-4 w-4 text-amber-400" /> : <CheckCircle className="h-4 w-4 text-emerald-400" />}
                  </Button>
                  <Button variant="danger" size="sm"
                    onClick={() => { if (confirm(`Hapus paket "${pkg.nama}"?`)) deleteMut.mutate(pkg.id); }}
                    isLoading={deleteMut.isPending}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
