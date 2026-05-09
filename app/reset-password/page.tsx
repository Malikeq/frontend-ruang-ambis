'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, Suspense } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  password:              z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Password tidak cocok', path: ['password_confirmation'],
});
type Form = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';
  const email        = searchParams.get('email') ?? '';
  const [showPw, setShowPw] = useState(false);
  const [done, setDone]     = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (d: Form) => authApi.resetPassword({ token, email, ...d }),
    onSuccess: () => {
      setDone(true);
      toast.success('Password berhasil direset!');
      setTimeout(() => router.push('/login'), 2500);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Token tidak valid atau sudah kadaluarsa.'),
  });

  const fields = [
    { key: 'password' as const,              label: 'Password Baru',        placeholder: '••••••••' },
    { key: 'password_confirmation' as const, label: 'Konfirmasi Password',  placeholder: '••••••••' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080810] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            ✦ AI Lolos PTN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-[#f1f5f9]">Reset Password</h1>
          <p className="mt-1 text-sm text-[#64748b]">Buat password baru yang kuat untuk akunmu</p>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141428] p-8">
          {done ? (
            <div className="space-y-3 text-center py-4">
              <CheckCircle2 className="h-14 w-14 text-[#10b981] mx-auto" />
              <p className="font-bold text-[#f1f5f9]">Password Berhasil Direset!</p>
              <p className="text-sm text-[#64748b]">Mengalihkan ke halaman login...</p>
            </div>
          ) : !token ? (
            <div className="space-y-3 text-center py-4">
              <div className="text-5xl">⚠️</div>
              <p className="font-semibold text-[#f1f5f9]">Link Tidak Valid</p>
              <p className="text-sm text-[#64748b]">Link reset password tidak valid. Silakan minta link baru.</p>
              <Link href="/forgot-password" className="mt-2 inline-block text-sm font-semibold text-[#6366f1] hover:underline">
                Minta Link Baru →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                    <input
                      {...register(key)}
                      id={key}
                      type={showPw ? 'text' : 'password'}
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] pl-10 pr-11 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all"
                    />
                    {key === 'password' && (
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8]">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  {errors[key] && <p className="mt-1 text-xs text-red-400">{errors[key]?.message}</p>}
                </div>
              ))}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {mutation.isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#080810]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
