'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, paymentApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';
import { Package, Trash2, Edit3, Plus, Check, RefreshCw } from 'lucide-react';

interface PkgForm {
  nama: string;
  tier: string;
  harga: number;
  durasi_hari: number;
  deskripsi: string;
  is_active: boolean;
}

const EMPTY_FORM: PkgForm = {
  nama: '', tier: 'premium', harga: 49000, durasi_hari: 30, deskripsi: '', is_active: true,
};

const FEATURES_MAP: Record<string, string[]> = {
  premium:    ['Soal unlimited', 'Tanya AI 30x/hari', 'Foto Soal 10x/hari', 'Analisis mendalam', 'Leaderboard premium'],
  daily_pass: ['Akses 24 jam penuh', 'Semua fitur premium', 'Tanpa komitmen bulanan'],
  free:       ['20 soal/sesi', 'Latihan harian dasar', 'Leaderboard umum'],
};

export default function AdminPackagesPage() {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<PkgForm>(EMPTY_FORM);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['packages'],
    queryFn: () => paymentApi.getPackages(),
    staleTime: 60_000,
  });

  const packages: any[] = data?.data?.data ?? [];

  const createMut = useMutation({
    mutationFn: (d: PkgForm) => adminApi.createPackage(d),
    onSuccess: () => {
      toast.success('Paket dibuat!');
      setShowForm(false);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: () => toast.error('Gagal membuat paket.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PkgForm> }) =>
      adminApi.updatePackage(id, data),
    onSuccess: () => {
      toast.success('Paket diperbarui!');
      setEditing(null);
      qc.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: () => toast.error('Gagal memperbarui paket.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deletePackage(id),
    onSuccess: () => { toast.success('Paket dihapus.'); qc.invalidateQueries({ queryKey: ['packages'] }); },
    onError:   () => toast.error('Gagal menghapus paket.'),
  });

  function handleField(key: keyof PkgForm, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  const tierColor: Record<string, string> = {
    premium:    'from-[#6366f1] to-[#8b5cf6]',
    daily_pass: 'from-[#0ea5e9] to-[#6366f1]',
    free:       'from-[#334155] to-[#475569]',
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="💳 Paket & Harga"
          description="Kelola paket langganan yang ditawarkan kepada pengguna"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="gradient" size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_FORM); }}>
                <Plus className="h-4 w-4" /> Paket Baru
              </Button>
            </div>
          }
        />

        {/* Create/Edit form */}
        {(showForm || editing) && (
          <Card className="border-[rgba(99,102,241,0.3)]">
            <h3 className="mb-4 font-semibold text-[#f1f5f9]">
              {editing ? 'Edit Paket' : 'Buat Paket Baru'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { key: 'nama' as const,        label: 'Nama Paket',    type: 'text',   placeholder: 'Premium Bulanan' },
                { key: 'harga' as const,       label: 'Harga (Rp)',    type: 'number', placeholder: '49000' },
                { key: 'durasi_hari' as const, label: 'Durasi (Hari)', type: 'number', placeholder: '30' },
                { key: 'deskripsi' as const,   label: 'Deskripsi',     type: 'text',   placeholder: 'Akses penuh 1 bulan' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => handleField(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">Tier</label>
                <select
                  value={form.tier}
                  onChange={e => handleField('tier', e.target.value)}
                  className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141428] px-4 py-2.5 text-sm text-[#94a3b8] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all"
                >
                  <option value="premium">Premium</option>
                  <option value="daily_pass">Daily Pass</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[#94a3b8]">Aktif</label>
                <button
                  onClick={() => handleField('is_active', !form.is_active)}
                  className={cn(
                    'relative h-6 w-10 rounded-full transition-colors',
                    form.is_active ? 'bg-[#6366f1]' : 'bg-[#334155]',
                  )}
                >
                  <div className={cn(
                    'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                    form.is_active ? 'translate-x-5' : 'translate-x-1',
                  )} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>
                Batal
              </Button>
              <Button
                variant="gradient"
                size="sm"
                isLoading={createMut.isPending || updateMut.isPending}
                onClick={() => {
                  if (editing) updateMut.mutate({ id: editing.id, data: form });
                  else createMut.mutate(form);
                }}
              >
                <Check className="h-4 w-4" />
                {editing ? 'Simpan Perubahan' : 'Buat Paket'}
              </Button>
            </div>
          </Card>
        )}

        {/* Package cards */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <Card key={i}><Skeleton className="h-48" /></Card>)}
          </div>
        ) : packages.length === 0 ? (
          <Card className="py-16 text-center">
            <Package className="h-10 w-10 text-[#334155] mx-auto mb-3" />
            <p className="font-semibold text-[#f1f5f9]">Belum ada paket</p>
            <p className="text-sm text-[#64748b] mt-1">Buat paket pertama menggunakan tombol di atas.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg: any) => (
              <Card key={pkg.id} className={cn(!pkg.is_active && 'opacity-60')}>
                {/* Gradient header */}
                <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br', tierColor[pkg.tier] ?? 'from-[#334155] to-[#475569]')}>
                  <Package className="h-6 w-6 text-white" />
                </div>

                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-[#f1f5f9]">{pkg.nama}</h3>
                  {!pkg.is_active && <Badge variant="warning">Nonaktif</Badge>}
                </div>
                <p className="text-2xl font-black text-[#f1f5f9] mb-0.5">{formatRupiah(pkg.harga)}</p>
                <p className="text-xs text-[#64748b] mb-3">per {pkg.durasi_hari} hari</p>

                {(FEATURES_MAP[pkg.tier] ?? []).map((f: string) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-1">
                    <Check className="h-3 w-3 text-[#10b981] shrink-0" /> {f}
                  </div>
                ))}

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setEditing(pkg); setShowForm(false); setForm({ nama: pkg.nama, tier: pkg.tier, harga: pkg.harga, durasi_hari: pkg.durasi_hari, deskripsi: pkg.deskripsi ?? '', is_active: pkg.is_active }); }}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => { if (confirm(`Hapus paket "${pkg.nama}"?`)) deleteMut.mutate(pkg.id); }}
                    isLoading={deleteMut.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
