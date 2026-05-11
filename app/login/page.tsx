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
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const schema = z.object({
  email:    z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type Form = z.infer<typeof schema>;

// Shared style helpers
const inputStyle = {
  width: '100%',
  borderRadius: '0.75rem',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  paddingTop: '0.75rem',
  paddingBottom: '0.75rem',
  paddingLeft: '2.5rem',
  paddingRight: '1rem',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
} as const;

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
    <div className="auth-page">
      <div className="w-full max-w-md">

        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black"
            style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ✦ AI Lolos PTN
          </Link>
          <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Masuk ke Akun</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Lanjutkan perjalanan belajar SNBT-mu</p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="auth-label">Email</label>
              {/* Wrapper: relative so the absolute icon overlays the input */}
              <div style={{ position: 'relative' }}>
                <Mail
                  style={{
                    position: 'absolute', left: '0.75rem',
                    top: '50%', transform: 'translateY(-50%)',
                    width: '1rem', height: '1rem',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }}
                />
                <input
                  {...register('email')}
                  id="email" type="email" placeholder="email@kamu.com"
                  style={inputStyle}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <label htmlFor="password" className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" className="auth-link text-xs">Lupa password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position: 'absolute', left: '0.75rem',
                    top: '50%', transform: 'translateY(-50%)',
                    width: '1rem', height: '1rem',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }}
                />
                <input
                  {...register('password')}
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem',
                    top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  {showPw ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loginMutation.isPending} className="auth-btn" style={{ marginTop: '0.5rem' }}>
              {loginMutation.isPending ? 'Masuk...' : 'Masuk →'}
            </button>
          </form>

          <div className="auth-demo-box" style={{ marginTop: '1rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Demo: </span>
            demo@ailolosiptn.com / demo123!
          </div>
        </div>

        <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Belum punya akun?{' '}
          <Link href="/register" className="auth-link">Daftar Gratis</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
