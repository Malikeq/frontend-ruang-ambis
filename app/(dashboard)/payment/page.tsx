'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { cn, formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';
import {
  CheckCircle2, Zap, Shield, Trophy,
  Sparkles, BookOpen, Camera, ChevronRight,
} from 'lucide-react';

const FEATURE_MAP: Record<string, { icon: any; text: string }[]> = {
  premium: [
    { icon: BookOpen,    text: 'Soal latihan unlimited' },
    { icon: Sparkles,    text: 'Tanya AI 30x per hari' },
    { icon: Camera,      text: 'Foto Soal AI 10x per hari' },
    { icon: Trophy,      text: 'Analisis kelemahan mendalam' },
    { icon: Zap,         text: 'Simulasi SNBT penuh' },
    { icon: Shield,      text: 'Akses semua sub-materi SNBT' },
  ],
  daily_pass: [
    { icon: BookOpen,    text: 'Semua fitur premium 24 jam' },
    { icon: Sparkles,    text: 'Tanya AI unlimited 1 hari' },
    { icon: Camera,      text: 'Foto Soal AI unlimited' },
    { icon: Zap,         text: 'Tanpa komitmen bulanan' },
  ],
};

const FREE_FEATURES = [
  { icon: BookOpen, text: '20 soal per sesi latihan' },
  { icon: Trophy,   text: 'Leaderboard umum' },
  { icon: Zap,      text: 'Latihan harian dasar' },
];

function PackageCard({
  pkg, isCurrent, isPopular, onBuy, loading,
}: {
  pkg: any; isCurrent: boolean; isPopular: boolean; onBuy: () => void; loading: boolean;
}) {
  const features = FEATURE_MAP[pkg.tier] ?? [];
  const gradients: Record<string, string> = {
    premium:    'from-[#6366f1] to-[#8b5cf6]',
    daily_pass: 'from-[#0ea5e9] to-[#6366f1]',
  };
  const grad = gradients[pkg.tier] ?? 'from-[#334155] to-[#475569]';

  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
      isPopular
        ? 'border-[rgba(99,102,241,0.5)] bg-gradient-to-b from-[rgba(99,102,241,0.08)] to-[rgba(99,102,241,0.02)] shadow-lg shadow-[rgba(99,102,241,0.15)]'
        : 'border-[rgba(255,255,255,0.08)] bg-[#141428]',
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-1 text-xs font-bold text-white shadow-lg">
            ✨ Paling Populer
          </div>
        </div>
      )}

      {/* Header */}
      <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br', grad)}>
        <Sparkles className="h-6 w-6 text-white" />
      </div>

      <h3 className="text-lg font-bold text-[#f1f5f9]">{pkg.nama}</h3>
      <p className="text-sm text-[#64748b] mt-0.5 mb-4">{pkg.deskripsi || `Akses premium selama ${pkg.durasi_hari} hari`}</p>

      <div className="mb-6">
        <span className="text-4xl font-black text-[#f1f5f9]">{formatRupiah(pkg.harga)}</span>
        <span className="ml-1 text-sm text-[#64748b]">/ {pkg.durasi_hari} hari</span>
      </div>

      {/* Features */}
      <div className="flex-1 space-y-2.5 mb-6">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-[#94a3b8]">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(16,185,129,0.15)]">
              <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
            </div>
            {text}
          </div>
        ))}
      </div>

      {isCurrent ? (
        <div className="rounded-xl border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] py-3 text-center text-sm font-semibold text-[#34d399]">
          ✅ Paket Aktifmu
        </div>
      ) : (
        <Button
          variant={isPopular ? 'gradient' : 'secondary'}
          size="lg"
          className="w-full"
          onClick={onBuy}
          isLoading={loading}
        >
          Beli Sekarang <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function PaymentPage() {
  const { user } = useAuthStore();

  const { data: pkgData, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => paymentApi.getPackages(),
    staleTime: 300_000,
  });

  const initiateMut = useMutation({
    mutationFn: (packageId: number) =>
      paymentApi.initiate({ package_id: packageId }),
    onSuccess: (res) => {
      const paymentUrl = res.data?.data?.payment_url;
      if (paymentUrl) {
        toast.info('Mengalihkan ke halaman pembayaran...');
        window.location.href = paymentUrl;
      } else {
        toast.success('Permintaan pembayaran dikirim! Tim kami akan menghubungimu.');
      }
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Gagal memulai pembayaran.'),
  });

  const packages: any[] = pkgData?.data?.data ?? [];
  const activePkgs = packages.filter(p => p.is_active);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="💳 Upgrade Akunmu"
        description="Buka akses penuh ke semua fitur AI Lolos PTN dan maksimalkan persiapan SNBT-mu"
      />

      {/* Current plan banner */}
      {user?.tier === 'free' && (
        <Card className="border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(245,158,11,0.15)]">
              <Zap className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <div>
              <p className="font-semibold text-[#f1f5f9]">Kamu saat ini di paket Gratis</p>
              <p className="text-xs text-[#64748b]">Upgrade untuk membuka soal unlimited, Tanya AI, dan analisis mendalam</p>
            </div>
          </div>
        </Card>
      )}
      {user?.tier === 'premium' && (
        <Card className="border-[rgba(99,102,241,0.3)] bg-gradient-to-r from-[rgba(99,102,241,0.08)] to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#f1f5f9]">Kamu sudah Premium! 🎉</p>
              <p className="text-xs text-[#64748b]">Nikmati semua fitur AI Lolos PTN tanpa batas</p>
            </div>
          </div>
        </Card>
      )}

      {/* Packages grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Card key={i}><Skeleton className="h-80" /></Card>)}
        </div>
      ) : activePkgs.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="text-5xl mb-3">🔧</div>
          <p className="font-semibold text-[#f1f5f9]">Paket sedang disiapkan</p>
          <p className="text-sm text-[#64748b] mt-1">Admin sedang mengkonfigurasi paket harga. Cek kembali nanti!</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activePkgs.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isCurrent={user?.tier === pkg.tier}
              isPopular={pkg.tier === 'premium' && i === 0}
              onBuy={() => initiateMut.mutate(pkg.id)}
              loading={initiateMut.isPending}
            />
          ))}
        </div>
      )}

      {/* Free plan comparison */}
      <Card className="border-[rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#f1f5f9]">Paket Gratis</h3>
            <p className="text-sm text-[#64748b]">Selalu gratis</p>
          </div>
          <span className="text-3xl font-black text-[#64748b]">Rp0</span>
        </div>
        <div className="space-y-2.5">
          {FREE_FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-[#64748b]">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(100,116,139,0.15)]">
                <CheckCircle2 className="h-3 w-3 text-[#475569]" />
              </div>
              {text}
            </div>
          ))}
        </div>
        {user?.tier === 'free' && (
          <div className="mt-4 rounded-xl border border-[rgba(100,116,139,0.3)] bg-[rgba(100,116,139,0.08)] py-2.5 text-center text-sm font-semibold text-[#64748b]">
            Paket Aktifmu
          </div>
        )}
      </Card>

      {/* Security note */}
      <div className="text-center space-y-1">
        <p className="text-xs text-[#334155] flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5" /> Pembayaran aman melalui Midtrans · SSL Encrypted
        </p>
        <p className="text-xs text-[#334155]">Butuh bantuan? Hubungi support@ailolosiptn.com</p>
      </div>
    </div>
  );
}
