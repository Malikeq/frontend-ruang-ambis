'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function PengamatRootLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) { router.replace('/pengamat/login'); return; }
    if (user?.role !== 'pengamat') { router.replace('/login'); }
  }, [token, user, router]);

  return <>{children}</>;
}
