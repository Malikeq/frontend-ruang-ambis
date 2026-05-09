'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

const schema = z.object({ email: z.string().email('Email tidak valid') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (d: Form) => authApi.forgotPassword(d.email),
    onSuccess:  () => { setSent(true); toast.success('Link reset dikirim ke emailmu!'); },
    onError:    () => toast.error('Gagal mengirim email. Periksa kembali alamat email.'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080810] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            ✦ AI Lolos PTN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-[#f1f5f9]">Lupa Password?</h1>
          <p className="mt-1 text-sm text-[#64748b]">Masukkan emailmu dan kami kirimkan link reset</p>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141428] p-8">
          {sent ? (
            <div className="space-y-3 text-center">
              <div className="text-5xl">📬</div>
              <p className="font-semibold text-[#f1f5f9]">Email Terkirim!</p>
              <p className="text-sm text-[#64748b]">Cek inbox (dan folder spam) untuk link reset password.</p>
              <Link href="/login" className="mt-4 block text-sm font-semibold text-[#6366f1] hover:underline">
                ← Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
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
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {mutation.isPending ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm">
          <Link href="/login" className="font-semibold text-[#6366f1] hover:underline">← Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
}
