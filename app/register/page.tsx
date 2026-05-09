'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const schema = z.object({
  name:                  z.string().min(2, 'Nama minimal 2 karakter'),
  email:                 z.string().email('Email tidak valid'),
  password:              z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Password tidak cocok', path: ['password_confirmation'],
});
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router   = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const regMutation = useMutation({
    mutationFn: (d: Form) => authApi.register(d),
    onSuccess: (res) => {
      // Auto-login after register — go straight to onboarding
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Selamat datang, ${user.name}! Ayo setup akun kamu 🎉`);
      router.push('/onboarding');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.errors?.email?.[0]
        ?? err?.response?.data?.message
        ?? 'Registrasi gagal';
      toast.error(msg);
    },
  });

  const fields = [
    { key: 'name' as const,                  label: 'Nama Lengkap',        type: 'text',     placeholder: 'Budi Pejuang PTN',  icon: User },
    { key: 'email' as const,                 label: 'Email',               type: 'email',    placeholder: 'email@kamu.com',    icon: Mail },
    { key: 'password' as const,              label: 'Password',            type: 'password', placeholder: '••••••••',          icon: Lock },
    { key: 'password_confirmation' as const, label: 'Konfirmasi Password', type: 'password', placeholder: '••••••••',          icon: Lock },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080810] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            ✦ AI Lolos PTN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-[#f1f5f9]">Buat Akun Gratis</h1>
          <p className="mt-1 text-sm text-[#64748b]">Mulai perjalanan lolos PTN-mu hari ini</p>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141428] p-8">
          <form onSubmit={handleSubmit(d => regMutation.mutate(d))} className="space-y-4">
            {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                  <input
                    {...register(key)}
                    id={key}
                    type={type === 'password' && key === 'password' && showPw ? 'text' : type}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] pl-10 pr-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all"
                  />
                  {type === 'password' && key === 'password' && (
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
              disabled={regMutation.isPending}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {regMutation.isPending ? 'Mendaftar...' : 'Daftar Sekarang 🚀'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[#64748b]">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-[#6366f1] hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
