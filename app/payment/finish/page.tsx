'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Clock, XCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFinishPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuthStore();
  const status   = params.get('status') ?? 'pending';
  const orderId  = params.get('order_id') ?? '';
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    if (status === 'success') {
      refreshUser?.().catch(() => {});
    }
  }, [status]);

  const configs = {
    success: {
      icon: <CheckCircle2 className="h-16 w-16 text-[#10b981]" />,
      glow: 'rgba(16,185,129,0.15)',
      border: 'rgba(16,185,129,0.25)',
      title: 'Pembayaran Berhasil! 🎉',
      sub: 'Akunmu sudah diupgrade. Selamat memulai perjalanan lolos PTN!',
      badge: 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border-[rgba(16,185,129,0.3)]',
      badgeText: '✅ Pembayaran Dikonfirmasi',
    },
    pending: {
      icon: <Clock className="h-16 w-16 text-[#f59e0b]" />,
      glow: 'rgba(245,158,11,0.1)',
      border: 'rgba(245,158,11,0.2)',
      title: 'Menunggu Pembayaran',
      sub: 'Pembayaranmu sedang diproses. Akun akan diupgrade otomatis setelah dikonfirmasi.',
      badge: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
      badgeText: '⏳ Menunggu Konfirmasi',
    },
    failed: {
      icon: <XCircle className="h-16 w-16 text-[#ef4444]" />,
      glow: 'rgba(239,68,68,0.1)',
      border: 'rgba(239,68,68,0.2)',
      title: 'Pembayaran Gagal',
      sub: 'Terjadi masalah dengan pembayaranmu. Silakan coba lagi atau gunakan metode lain.',
      badge: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
      badgeText: '❌ Pembayaran Ditolak',
    },
  };

  const cfg = configs[status as keyof typeof configs] ?? configs.pending;

  return (
    <div className={`min-h-screen bg-[#0B0B1A] flex items-center justify-center p-6 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full blur-[120px] opacity-30" style={{ backgroundColor: cfg.glow }} />
      </div>

      <Card className="max-w-md w-full text-center py-10 px-8" style={{ borderColor: cfg.border }}>
        {/* Icon */}
        <div className="flex justify-center mb-6">{cfg.icon}</div>

        {/* Badge */}
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold mb-4 ${cfg.badge}`}>
          {cfg.badgeText}
        </div>

        <h1 className="text-2xl font-black text-white mb-3">{cfg.title}</h1>
        <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">{cfg.sub}</p>

        {orderId && (
          <p className="text-xs text-[#334155] mb-6 font-mono">
            Order ID: {orderId}
          </p>
        )}

        {/* Benefits if success */}
        {status === 'success' && (
          <div className="mb-6 rounded-xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.04)] p-4 text-left space-y-2.5">
            {[
              '🤖 AI Tutor aktif — tanya apapun',
              '📝 Soal latihan tidak terbatas',
              '📊 Analisis kelemahan personal',
              '🎯 Tryout penuh SNBT tersedia',
            ].map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <CheckCircle2 className="h-4 w-4 text-[#10b981] shrink-0" />
                {b}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {status === 'success' && (
            <Link href="/dashboard">
              <Button variant="gradient" className="w-full" size="lg">
                Mulai Belajar <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {status === 'pending' && (
            <Button variant="gradient" className="w-full" size="lg" onClick={() => router.push('/dashboard')}>
              Ke Dashboard
            </Button>
          )}
          {status === 'failed' && (
            <Button variant="gradient" className="w-full" size="lg" onClick={() => router.push('/payment')}>
              Coba Lagi
            </Button>
          )}
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full gap-2" size="sm">
              <Home className="h-4 w-4" /> Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
