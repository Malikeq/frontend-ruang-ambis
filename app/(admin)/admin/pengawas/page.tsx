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
import {
  Search, RefreshCw, Eye, Plus, Trash2, CheckCircle,
  XCircle, School, UserPlus, X, Loader2,
} from 'lucide-react';

// ── Create Pengawas Modal ────────────────────────────────────────────────────

function CreatePengawasModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', sekolah_id: 0, jabatan: '' });
  const [sekolahQ, setSekolahQ] = useState('');
  const [selSekolah, setSelSekolah] = useState<any>(null);

  const sekolahQuery = useQuery({
    queryKey: ['admin-sekolah-search', sekolahQ],
    queryFn: () => adminApi.getSekolahs({ q: sekolahQ, per_page: 10 }),
    enabled: sekolahQ.length >= 2,
    staleTime: 10_000,
  });
  const sekolahs: any[] = sekolahQuery.data?.data?.data?.data ?? [];

  const createMut = useMutation({
    mutationFn: () => adminApi.createPengamat({ ...form, sekolah_id: selSekolah?.id }),
    onSuccess: () => {
      toast.success('Akun pengawas berhasil dibuat!');
      qc.invalidateQueries({ queryKey: ['admin-pengawas'] });
      onClose();
      setForm({ name: '', email: '', password: '', sekolah_id: 0, jabatan: '' });
      setSelSekolah(null);
      setSekolahQ('');
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? 'Gagal membuat akun.';
      toast.error(msg);
    },
  });

  if (!open) return null;

  const valid = form.name.trim() && form.email.includes('@') && form.password.length >= 8 && selSekolah;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#0d0d1f', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Buat Akun Pengawas</h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Akun langsung aktif, tanpa approval</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <Field label="Nama Lengkap" placeholder="Contoh: Budi Santoso, S.Pd"
            value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Email" placeholder="email@sekolah.sch.id" type="email"
            value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="Password" placeholder="Minimal 8 karakter" type="password"
            value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
          <Field label="Jabatan (opsional)" placeholder="Guru BK, Wali Kelas, dll"
            value={form.jabatan} onChange={v => setForm(f => ({ ...f, jabatan: v }))} />

          {/* School picker */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Sekolah *
            </label>
            {selSekolah ? (
              <div className="flex items-center gap-3 rounded-xl p-3"
                style={{ backgroundColor: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)' }}>
                <School className="h-4 w-4 shrink-0" style={{ color: '#10B981' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{selSekolah.nama}</p>
                  {selSekolah.kota && (
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {selSekolah.kota}{selSekolah.provinsi ? `, ${selSekolah.provinsi}` : ''}
                    </p>
                  )}
                </div>
                <button onClick={() => { setSelSekolah(null); setSekolahQ(''); }}
                  className="rounded-lg p-1 hover:bg-white/10 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#475569' }} />
                  <input
                    value={sekolahQ}
                    onChange={e => setSekolahQ(e.target.value)}
                    placeholder="Ketik nama sekolah..."
                    className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-[#475569] outline-none transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' }}
                  />
                  {sekolahQuery.isFetching && (
                    <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin" style={{ color: '#059669' }} />
                  )}
                </div>
                {sekolahs.length > 0 && (
                  <div className="mt-1 rounded-xl overflow-hidden max-h-40 overflow-y-auto"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0a0a1a' }}>
                    {sekolahs.map((s: any) => (
                      <button key={s.id}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                        onClick={() => { setSelSekolah(s); setSekolahQ(''); }}>
                        <School className="h-3.5 w-3.5 shrink-0" style={{ color: '#475569' }} />
                        <div className="min-w-0">
                          <p className="text-white truncate">{s.nama}</p>
                          {s.kota && <p className="text-[10px]" style={{ color: '#475569' }}>{s.kota}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {sekolahQ.length >= 2 && !sekolahQuery.isFetching && sekolahs.length === 0 && (
                  <p className="text-xs mt-2 text-center" style={{ color: '#475569' }}>
                    Sekolah tidak ditemukan. Buat sekolah baru dari halaman admin.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">Batal</Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => createMut.mutate()}
            disabled={!valid}
            isLoading={createMut.isPending}
            className="flex-1"
            style={valid ? {
              background: 'linear-gradient(135deg, #059669, #10B981)',
              boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
            } : {}}
          >
            <UserPlus className="h-4 w-4" /> Buat Akun
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl py-2.5 px-4 text-sm text-white placeholder-[#475569] outline-none transition-all focus:border-[rgba(5,150,105,0.5)]"
        style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' }}
      />
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; border: string; text: string; label: string }> = {
    approved: { bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.3)', text: '#10B981', label: '✅ Aktif' },
    pending:  { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B', label: '⏳ Pending' },
    rejected: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#EF4444', label: '❌ Ditolak' },
  };
  const c = cfg[status] ?? cfg.pending;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {c.label}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPengawasPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-pengawas', status, search, page],
    queryFn: () => adminApi.getPengamats({ status, search, page, per_page: 20 }),
    staleTime: 30_000,
  });

  const items: any[] = data?.data?.data?.data ?? [];
  const meta = data?.data?.data ?? { current_page: 1, last_page: 1, total: 0 };

  const approveMut = useMutation({
    mutationFn: (id: number) => adminApi.approvePengamat(id),
    onSuccess: () => { toast.success('Pengawas disetujui!'); qc.invalidateQueries({ queryKey: ['admin-pengawas'] }); },
  });
  const rejectMut = useMutation({
    mutationFn: (id: number) => adminApi.rejectPengamat(id),
    onSuccess: () => { toast.success('Pengawas ditolak.'); qc.invalidateQueries({ queryKey: ['admin-pengawas'] }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deletePengamat(id),
    onSuccess: () => { toast.success('Pengawas dihapus.'); qc.invalidateQueries({ queryKey: ['admin-pengawas'] }); },
  });

  const STATUS_TABS = [
    { id: 'all',      label: 'Semua' },
    { id: 'approved', label: '✅ Aktif' },
    { id: 'pending',  label: '⏳ Pending' },
    { id: 'rejected', label: '❌ Ditolak' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="👁️ Pengawas Sekolah"
        description="Kelola akun pengawas yang memantau progress siswa per sekolah"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              style={{
                background: 'linear-gradient(135deg, #059669, #10B981)',
                boxShadow: '0 4px 14px rgba(5,150,105,0.25)',
                color: 'white',
              }}
            >
              <Plus className="h-4 w-4" /> Buat Pengawas
            </Button>
          </div>
        }
      />

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status tabs */}
        <div className="flex gap-1.5 rounded-xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {STATUS_TABS.map(t => (
            <button key={t.id}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                status === t.id ? 'text-white' : '')}
              style={status === t.id
                ? { backgroundColor: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.3)', color: '#10B981' }
                : { color: 'rgba(255,255,255,0.4)' }}
              onClick={() => { setStatus(t.id); setPage(1); }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama pengawas atau sekolah..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' }}
          />
        </div>
      </div>

      {/* List */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Eye className="h-10 w-10 mb-3" style={{ color: '#334155' }} />
            <p className="font-semibold text-[#f1f5f9]">Belum ada pengawas</p>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>Klik "Buat Pengawas" untuk menambahkan</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {items.map((item: any) => {
                const u = item.pengamat;
                const s = item.sekolah;
                if (!u) return null;
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    <div className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                      item.status === 'approved'
                        ? 'bg-gradient-to-br from-[#059669] to-[#10B981]'
                        : item.status === 'rejected'
                        ? 'bg-[#334155]'
                        : 'bg-gradient-to-br from-[#F59E0B] to-[#FBBF24]',
                    )}>
                      {getInitials(u.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#f1f5f9]">{u.name}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="truncate text-xs text-[#64748b]">{u.email}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {s && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: '#10B981' }}>
                            <School className="h-3 w-3" /> {s.nama}
                          </span>
                        )}
                        {item.catatan && (
                          <span className="text-[10px]" style={{ color: '#475569' }}>· {item.catatan}</span>
                        )}
                        <span className="text-[10px]" style={{ color: '#475569' }}>
                          · {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm"
                            onClick={() => approveMut.mutate(item.id)}
                            isLoading={approveMut.isPending}
                            style={{ color: '#10B981' }}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm"
                            onClick={() => rejectMut.mutate(item.id)}
                            isLoading={rejectMut.isPending}
                            style={{ color: '#EF4444' }}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="danger" size="sm"
                        onClick={() => { if (confirm(`Hapus pengawas ${u.name}?`)) deleteMut.mutate(item.id); }}
                        isLoading={deleteMut.isPending}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="flex items-center justify-between border-t px-5 py-3"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs" style={{ color: '#475569' }}>Hal {meta.current_page}/{meta.last_page}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <Button variant="secondary" size="sm" disabled={page >= meta.last_page}
                    onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Modal */}
      <CreatePengawasModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
