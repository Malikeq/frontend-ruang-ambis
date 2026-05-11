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
import { Eye, EyeOff, User, Mail, Lock, LucideIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const schema = z.object({
  name:                  z.string().min(2, 'Nama minimal 2 karakter'),
  email:                 z.string().email('Email tidak valid'),
  password:              z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Password tidak cocok', path: ['password_confirmation'],
});
type Form = z.infer<typeof schema>;

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

const iconStyle = {
  position: 'absolute' as const,
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '1rem',
  height: '1rem',
  color: 'var(--text-muted)',
  pointerEvents: 'none' as const,
};

export default function RegisterPage() {
  const router   = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const regMutation = useMutation({
    mutationFn: (d: Form) => authApi.register(d),
    onSuccess: (res) => {
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Selamat datang, ${user.name}! Ayo setup akun kamu 🎉`);
      router.push('/onboarding');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.errors?.email?.[0]
        ?? err?.response?.data?.message ?? 'Registrasi gagal';
      toast.error(msg);
    },
  });

  const FIELDS: { key: keyof Form; label: string; type: string; placeholder: string; Icon: LucideIcon }[] = [
    { key: 'name',                  label: 'Nama Lengkap',        type: 'text',     placeholder: 'Budi Pejuang PTN', Icon: User },
    { key: 'email',                 label: 'Email',               type: 'email',    placeholder: 'email@kamu.com',   Icon: Mail },
    { key: 'password',              label: 'Password',            type: 'password', placeholder: '••••••••',         Icon: Lock },
    { key: 'password_confirmation', label: 'Konfirmasi Password', type: 'password', placeholder: '••••••••',         Icon: Lock },
  ];

  return (
    <div className="auth-page">
      <div className="w-full max-w-md">

        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-black"
            style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ✦ AI Lolos PTN
          </Link>
          <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Buat Akun Gratis</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Mulai perjalanan lolos PTN-mu hari ini</p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit(d => regMutation.mutate(d))} className="space-y-4">
            {FIELDS.map(({ key, label, type, placeholder, Icon }) => {
              const isPassword = type === 'password';
              const resolvedType = isPassword && key === 'password' && showPw ? 'text' : type;

              return (
                <div key={key}>
                  <label htmlFor={key} className="auth-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Icon style={iconStyle} />
                    <input
                      {...register(key)}
                      id={key}
                      type={resolvedType}
                      placeholder={placeholder}
                      style={{
                        ...inputStyle,
                        paddingRight: isPassword && key === 'password' ? '2.75rem' : '1rem',
                      }}
                    />
                    {isPassword && key === 'password' && (
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
                    )}
                  </div>
                  {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]?.message}</p>}
                </div>
              );
            })}

            <button type="submit" disabled={regMutation.isPending} className="auth-btn" style={{ marginTop: '0.5rem' }}>
              {regMutation.isPending ? 'Mendaftar...' : 'Daftar Sekarang 🚀'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Sudah punya akun?{' '}
          <Link href="/login" className="auth-link">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
