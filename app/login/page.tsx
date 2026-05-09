'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState, Suspense } from 'react';

const schema = z.object({
  email:    z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type Form = z.infer<typeof schema>;

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setAuth }  = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const loginMutation = useMutation({
    mutationFn: (d: Form) => authApi.login(d),
    onSuccess: (res) => {
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Selamat datang kembali, ${user.name}! 👋`);
      if (user.role === 'superadmin')    { router.push('/admin/dashboard'); return; }
      if (!user.onboarding_completed)    { router.push('/onboarding');      return; }
      const next = searchParams.get('next');
      router.push(next && next.startsWith('/') ? next : '/dashboard');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Email atau password salah'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080810] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            ✦ AI Lolos PTN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-[#f1f5f9]">Masuk ke Akun</h1>
          <p className="mt-1 text-sm text-[#64748b]">Lanjutkan perjalanan belajar SNBT-mu</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141428] p-8">
          <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="email@kamu.com"
                  className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] pl-10 pr-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-[#94a3b8]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#6366f1] hover:underline">Lupa password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                <input
                  {...register('password')}
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] pl-10 pr-11 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8]">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loginMutation.isPending ? 'Masuk...' : 'Masuk →'}
            </button>
          </form>

          {/* Demo login */}
          <div className="mt-4 rounded-xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.06)] p-3 text-center text-xs text-[#64748b]">
            <span className="font-medium text-[#a5b4fc]">Demo:</span> demo@ailolosiptn.com / demo123!
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-[#64748b]">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-[#6366f1] hover:underline">Daftar Gratis</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#080810]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent"/></div>}>
      <LoginForm />
    </Suspense>
  );
}
