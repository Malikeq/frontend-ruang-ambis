'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PengamatLoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const mut = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (res) => {
      const { user, token } = res.data?.data ?? res.data ?? {};
      if (user?.role !== 'pengamat') {
        toast.error('Akun ini bukan akun pengamat.');
        return;
      }
      setAuth(user, token);
      router.push('/pengamat/dashboard');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Login gagal.'),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
            <GraduationCap className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Portal Pengamat</h1>
          <p className="text-sm text-slate-400 mt-1">Pantau progres siswa sekolahmu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Masuk ke Dashboard</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="guru@sekolah.sch.id"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && mut.mutate()}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <button onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || !email || !password}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25">
            {mut.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Masuk...</> : 'Masuk'}
          </button>

          <div className="mt-6 text-center text-xs text-slate-400">
            Belum punya akun?{' '}
            <Link href="/pengamat/register" className="text-emerald-600 font-bold hover:underline">
              Daftar sebagai Pengamat
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Akun siswa?{' '}
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}
