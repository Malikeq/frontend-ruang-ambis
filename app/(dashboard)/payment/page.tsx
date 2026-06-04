'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { cn, formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Zap, Shield, Sparkles,
  BookOpen, Camera, Tag, ChevronRight, Lock,
} from 'lucide-react';

// ─── Snap.js loader ───────────────────────────────────────────────────────────
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (r: any) => void;
        onPending?: (r: any) => void;
        onError?:   (r: any) => void;
        onClose?:   ()       => void;
      }) => void;
    };
  }
}

function loadSnapScript(isProduction: boolean, clientKey: string): Promise<void> {
  return new Promise(resolve => {
    // Check if already loaded with the SAME client key
    const existingScript = document.querySelector('script[data-snap="1"]') as HTMLScriptElement | null;
    const loadedKey = existingScript?.getAttribute('data-client-key');

    if (window.snap && loadedKey === clientKey) {
      // Already loaded with correct key — reuse
      resolve(); return;
    }

    // Remove stale script + clear cached snap instance
    existingScript?.remove();
    // @ts-ignore
    delete window.snap;

    const src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const script = document.createElement('script');
    script.src = src;
    script.setAttribute('data-client-key', clientKey);
    script.setAttribute('data-snap', '1');
    script.onload = () => resolve();
    script.onerror = () => {
      console.error('[Midtrans] Failed to load snap.js from', src);
      resolve(); // resolve anyway — snap.pay() will handle error
    };
    document.head.appendChild(script);
  });
}

const FEATURE_ICONS: Record<string, any> = {
  ai_tutor:            { icon: Sparkles, text: 'AI Tutor Chat' },
  ai_tanya_harian:     { icon: Sparkles, text: 'Tanya AI / hari' },
  ai_photo_solve:      { icon: Camera,   text: 'Foto Soal AI' },
  review_jawaban:      { icon: BookOpen, text: 'Review Jawaban' },
  riwayat_latihan:     { icon: BookOpen, text: 'Riwayat Latihan' },
  analisis_kelemahan:  { icon: Zap,      text: 'Analisis Kelemahan' },
  tryout_penuh:        { icon: Zap,      text: 'Tryout Penuh SNBT' },
  akses_semua_mapel:   { icon: BookOpen, text: 'Semua Mapel' },
  soal_adaptif:        { icon: Sparkles, text: 'Soal Adaptif' },
  export_hasil:        { icon: Zap,      text: 'Export PDF' },
  bonus_poin_streak:   { icon: Zap,      text: 'Bonus Streak' },
};

function getFeatureList(fiturJson: any) {
  if (!fiturJson) return [];
  return Object.entries(FEATURE_ICONS)
    .filter(([key]) => {
      const v = fiturJson[key];
      return v === true || (typeof v === 'number' && v !== 0);
    })
    .map(([key, { icon, text }]) => {
      const v = fiturJson[key];
      const suffix = typeof v === 'number' ? ` ${v === -1 ? '∞' : v}` : '';
      return { icon, text: text + suffix };
    })
    .slice(0, 8);
}

// ─── Package Card ─────────────────────────────────────────────────────────────
function PackageCard({
  pkg, isCurrent, isPopular, onBuy, loading,
}: {
  pkg: any; isCurrent: boolean; isPopular: boolean;
  onBuy: () => void; loading: boolean;
}) {
  const features = getFeatureList(pkg.fitur_json);
  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.01]',
      isPopular
        ? 'border-[rgba(99,102,241,0.6)] bg-gradient-to-b from-[rgba(99,102,241,0.1)] to-[rgba(99,102,241,0.02)] shadow-xl shadow-[rgba(99,102,241,0.2)]'
        : 'border-[rgba(255,255,255,0.08)] bg-[#141428]',
    )}>
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <div className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-5 py-1.5 text-xs font-bold text-white shadow-lg">
            ✨ Paling Populer
          </div>
        </div>
      )}

      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
        <Sparkles className="h-5 w-5 text-white" />
      </div>

      <h3 className="text-lg font-bold text-white">{pkg.nama}</h3>
      <div className="mb-5 mt-2">
        <span className="text-4xl font-black text-white">{formatRupiah(pkg.harga_idr)}</span>
        <span className="ml-1.5 text-sm text-[#64748b]">/ {pkg.durasi_hari} hari</span>
      </div>

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
        <Button variant={isPopular ? 'gradient' : 'secondary'} size="lg" className="w-full" onClick={onBuy} isLoading={loading}>
          Beli Sekarang <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ─── Promo Input ──────────────────────────────────────────────────────────────
function PromoInput({ onApply }: { onApply: (kode: string, d: number) => void }) {
  const [kode, setKode]   = useState('');
  const [msg, setMsg]     = useState('');
  const [ok, setOk]       = useState(false);
  const [loading, setL]   = useState(false);

  const apply = async () => {
    if (!kode.trim()) return;
    setL(true); setMsg('');
    try {
      const res = await paymentApi.applyPromo(kode);
      const d   = res.data?.data?.diskon_persen ?? 0;
      setOk(true); setMsg(`✅ Diskon ${d}% berhasil diterapkan!`);
      onApply(kode.trim(), d);
    } catch {
      setOk(false); setMsg('❌ Kode promo tidak valid atau sudah habis.');
    } finally { setL(false); }
  };

  return (
    <Card className="border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.03)]">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-[#f59e0b]" />
        <p className="text-sm font-semibold text-[#f1f5f9]">Punya kode promo?</p>
      </div>
      <div className="flex gap-2">
        <input
          value={kode}
          onChange={e => setKode(e.target.value.toUpperCase())}
          placeholder="KODE-PROMO"
          className="flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(245,158,11,0.4)] tracking-widest"
          onKeyDown={e => e.key === 'Enter' && apply()}
        />
        <Button variant="secondary" size="sm" onClick={apply} isLoading={loading}>Pakai</Button>
      </div>
      {msg && <p className={cn('text-xs mt-2', ok ? 'text-[#10b981]' : 'text-[#ef4444]')}>{msg}</p>}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const { user, refreshUser } = useAuthStore();
  const router      = useRouter();
  const [promoCode, setPromoCode]   = useState('');
  const [buyingId,  setBuyingId]    = useState<number | null>(null);
  const snapReady   = useRef(false);

  const { data: pkgData, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn:  () => paymentApi.getPackages(),
    staleTime: 300_000,
  });
  const packages: any[] = (pkgData?.data?.data ?? []).filter((p: any) => p.is_active);

  const initiateMut = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      paymentApi.initiate({ package_id: id, promo_code: promoCode || undefined }),
  });

  const handleBuy = async (pkg: any) => {
    setBuyingId(pkg.id);
    try {
      const res     = await initiateMut.mutateAsync({ id: pkg.id });
      const payment = res?.data?.data;
      if (!payment?.snap_token) throw new Error('Snap token tidak ditemukan');

      // Always reload snap.js to ensure correct data-client-key
      snapReady.current = false;
      await loadSnapScript(payment.is_production, payment.client_key);
      snapReady.current = true;

      window.snap?.pay(payment.snap_token, {
        onSuccess: async (result: any) => {
          toast.loading('Mengaktifkan langganan...', { id: 'activate' });
          try {
            // Trigger subscription activation via status check
            await paymentApi.status(result.order_id);
          } catch { /* continue anyway */ }
          await refreshUser?.();
          toast.success('Pembayaran berhasil! 🎉', { id: 'activate' });
          router.push(`/payment/finish?order_id=${result.order_id}&status=success`);
        },
        onPending: (result: any) => {
          toast.info('Menunggu konfirmasi pembayaran...');
          router.push(`/payment/finish?order_id=${result.order_id}&status=pending`);
        },
        onError: (result: any) => {
          toast.error('Pembayaran gagal. Silakan coba lagi.');
          console.error('Snap error:', result);
        },
        onClose: () => {
          toast.info('Pembayaran dibatalkan.');
        },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Gagal memulai pembayaran.');
    } finally {
      setBuyingId(null);
    }
  };

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

      {/* Packages */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2].map(i => <Card key={i}><Skeleton className="h-96" /></Card>)}
        </div>
      ) : packages.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="text-5xl mb-3">🔧</div>
          <p className="font-semibold text-[#f1f5f9]">Paket sedang disiapkan</p>
          <p className="text-sm text-[#64748b] mt-1">Admin sedang mengkonfigurasi paket harga. Cek kembali nanti!</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isCurrent={user?.tier === pkg.tier}
              isPopular={pkg.tier === 'premium'}
              onBuy={() => handleBuy(pkg)}
              loading={buyingId === pkg.id}
            />
          ))}
        </div>
      )}

      {/* Promo */}
      <PromoInput onApply={(kode) => setPromoCode(kode)} />

      {/* Security */}
      <div className="text-center space-y-1">
        <p className="text-xs text-[#334155] flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Pembayaran aman melalui Midtrans · SSL Encrypted · PCI DSS Compliant
        </p>
        <p className="text-xs text-[#334155]">Butuh bantuan? support@ailolosiptn.com</p>
      </div>
    </div>
  );
}
