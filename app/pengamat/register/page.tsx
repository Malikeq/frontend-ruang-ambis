'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { pengamatApi } from '@/lib/api';
import { toast } from 'sonner';
import { GraduationCap, Search, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PengamatRegisterPage() {
  const router = useRouter();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [sekolahId, setSekolahId] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const { data: sekolahData } = useQuery({
    queryKey: ['sekolah-list', debouncedQ],
    queryFn:  () => pengamatApi.sekolahList(debouncedQ),
    staleTime: 30_000,
  });
  const sekolahs: Array<{ id: number; nama: string; kota: string; provinsi: string }> =
    sekolahData?.data?.data ?? [];

  const selectedSekolah = sekolahs.find(s => s.id === sekolahId);

  const mut = useMutation({
    mutationFn: () => pengamatApi.register({ name, email, password, sekolah_id: sekolahId! }),
    onSuccess: () => {
      toast.success('Pendaftaran berhasil! Menunggu verifikasi admin.');
      router.push('/pengamat/pending');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Pendaftaran gagal.'),
  });

  const canSubmit = name && email && password.length >= 8 && sekolahId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-3">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Daftar sebagai Pengamat</h1>
          <p className="text-sm text-slate-400 mt-1">Akun akan diverifikasi oleh admin sebelum aktif</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-5">
          <h2 className="text-lg font-bold text-slate-800">Data Pengamat</h2>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nama Lengkap</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Budi Santoso, S.Pd"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none transition-all" />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="guru@sekolah.sch.id"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none transition-all" />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Password (min. 8 karakter)</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm focus:border-emerald-400 focus:outline-none transition-all" />
              <button onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Sekolah picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Pilih Sekolah</label>

            {selectedSekolah ? (
              <div className="flex items-center justify-between rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">{selectedSekolah.nama}</p>
                  <p className="text-xs text-emerald-600">{selectedSekolah.kota}</p>
                </div>
                <button onClick={() => setSekolahId(null)}
                  className="text-xs text-emerald-600 hover:underline font-semibold">Ganti</button>
              </div>
            ) : (
              <>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input value={q} onChange={e => setQ(e.target.value)}
                    placeholder="Cari nama sekolah..."
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-3 text-sm focus:border-emerald-400 focus:outline-none transition-all" />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-slate-100 p-1">
                  {sekolahs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      {q ? 'Sekolah tidak ditemukan' : 'Ketik untuk mencari sekolah'}
                    </p>
                  ) : sekolahs.map(s => (
                    <button key={s.id} onClick={() => setSekolahId(s.id)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all',
                        sekolahId === s.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-slate-50 text-slate-700',
                      )}>
                      <div>
                        <p className="font-medium">{s.nama}</p>
                        {s.kota && <p className="text-xs text-slate-400">{s.kota}</p>}
                      </div>
                      {sekolahId === s.id && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => mut.mutate()}
            disabled={!canSubmit || mut.isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/25">
            {mut.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Mendaftar...</> : 'Daftar & Tunggu Verifikasi'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Sudah punya akun?{' '}
            <Link href="/pengamat/login" className="text-emerald-600 font-bold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
