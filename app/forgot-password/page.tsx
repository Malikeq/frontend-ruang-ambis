'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const schema = z.object({ email: z.string().email('Email tidak valid') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (d: Form) => authApi.forgotPassword(d.email),
    onSuccess:  () => { setSent(true); toast.success('Link reset dikirim ke emailmu!'); },
    onError:    () => toast.error('Gagal mengirim email. Periksa kembali alamat email.'),
  });

  return (
    <div className="auth-page">
      <div className="w-full max-w-md">

        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ✦ AI Lolos PTN
          </Link>
          <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Lupa Password?</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Masukkan emailmu dan kami kirimkan link reset</p>
        </div>

        <div className="auth-card">
          {sent ? (
            <div className="space-y-3 text-center py-4">
              <div className="text-5xl">📬</div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Email Terkirim!</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cek inbox (dan folder spam) untuk link reset password.</p>
              <Link href="/login" className="auth-link mt-3 block text-sm">← Kembali ke Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
              <div>
                <label className="auth-label" htmlFor="email">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input {...register('email')} id="email" type="email"
                    placeholder="email@kamu.com"
                    style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '0.875rem', padding: '0.75rem 1rem 0.75rem 2.5rem', outline: 'none' }}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={mutation.isPending} className="auth-btn">
                {mutation.isPending ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm">
          <Link href="/login" className="auth-link">← Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
}
