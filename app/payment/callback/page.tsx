'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { paymentApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type PaymentStatus = 'loading' | 'success' | 'pending' | 'failed';

function PaymentCallbackContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setUser }  = useAuthStore();

  const orderId         = searchParams.get('order_id') ?? '';
  const statusFromQuery = searchParams.get('transaction_status') ?? '';

  const [status, setStatus] = useState<PaymentStatus>('loading');

  // Poll payment status from backend
  const { data } = useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: () => orderId ? paymentApi.status(orderId) : Promise.resolve(null),
    enabled: !!orderId,
    refetchInterval: (data) => {
      const s = data?.state?.data?.data?.status;
      return s === 'settlement' || s === 'capture' || s === 'expire' || s === 'cancel' ? false : 3000;
    },
    staleTime: 0,
  });

  useEffect(() => {
    const s = data?.data?.data?.status ?? statusFromQuery;

    if (!s || s === 'pending' || s === 'authorize') {
      setStatus('pending');
    } else if (s === 'settlement' || s === 'capture') {
      setStatus('success');
      // Refresh user data so tier updates
      authApi.me().then(res => setUser(res.data.data)).catch(() => {});
    } else if (s === 'expire' || s === 'cancel' || s === 'deny' || s === 'failure') {
      setStatus('failed');
    } else {
      setStatus('loading');
    }
  }, [data, statusFromQuery]);

  const config: Record<PaymentStatus, {
    icon: any; iconColor: string; bg: string; border: string;
    title: string; desc: string; cta: string; ctaHref: string;
  }> = {
    loading: {
      icon: Loader2,   iconColor: 'text-[#6366f1]', bg: '',       border: '',
      title: 'Memeriksa Status...', desc: 'Sedang memverifikasi pembayaranmu.',
      cta: '', ctaHref: '',
    },
    success: {
      icon: CheckCircle2, iconColor: 'text-[#10b981]',
      bg: 'bg-[rgba(16,185,129,0.06)]', border: 'border-[rgba(16,185,129,0.3)]',
      title: 'Pembayaran Berhasil! 🎉',
      desc: 'Akunmu sudah diupgrade ke Premium. Selamat belajar tanpa batas!',
      cta: 'Mulai Belajar Sekarang', ctaHref: '/dashboard',
    },
    pending: {
      icon: Clock,  iconColor: 'text-[#f59e0b]',
      bg: 'bg-[rgba(245,158,11,0.06)]', border: 'border-[rgba(245,158,11,0.3)]',
      title: 'Menunggu Pembayaran',
      desc: 'Pembayaranmu sedang diverifikasi. Proses biasanya selesai dalam beberapa menit.',
      cta: 'Kembali ke Dashboard', ctaHref: '/dashboard',
    },
    failed: {
      icon: XCircle, iconColor: 'text-[#ef4444]',
      bg: 'bg-[rgba(239,68,68,0.06)]', border: 'border-[rgba(239,68,68,0.3)]',
      title: 'Pembayaran Gagal',
      desc: 'Pembayaran dibatalkan atau gagal diproses. Kamu bisa mencoba lagi.',
      cta: 'Coba Lagi', ctaHref: '/payment',
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080810] px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
          ✦ AI Lolos PTN
        </Link>

        {/* Status card */}
        <div className={cn(
          'mt-8 rounded-2xl border p-8',
          c.border || 'border-[rgba(255,255,255,0.08)]',
          c.bg || 'bg-[#141428]',
        )}>
          {status === 'loading' ? (
            <Loader2 className="mx-auto h-16 w-16 text-[#6366f1] animate-spin mb-4" />
          ) : (
            <Icon className={cn('mx-auto h-16 w-16 mb-4', c.iconColor)} />
          )}

          <h1 className="text-xl font-bold text-[#f1f5f9] mb-2">{c.title}</h1>
          <p className="text-sm text-[#64748b] mb-6">{c.desc}</p>

          {orderId && (
            <p className="mb-4 text-xs text-[#334155]">Order ID: {orderId}</p>
          )}

          {c.cta && c.ctaHref && (
            <Link href={c.ctaHref}>
              <Button variant="gradient" size="lg" className="w-full">
                {c.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Auto-redirect note for success */}
        {status === 'success' && (
          <p className="mt-4 text-xs text-[#334155]">
            Otomatis diarahkan ke dashboard dalam 5 detik...
          </p>
        )}

        {/* Support link */}
        <p className="mt-6 text-xs text-[#334155]">
          Ada masalah? Hubungi{' '}
          <a href="mailto:support@ailolosiptn.com" className="text-[#6366f1] hover:underline">
            support@ailolosiptn.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#080810]">
        <Loader2 className="h-10 w-10 animate-spin text-[#6366f1]" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
