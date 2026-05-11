'use client';

import { useQuery } from '@tanstack/react-query';
import { weaknessApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { cn, getMapelColor } from '@/lib/utils';
import Link from 'next/link';
import {
  BarChart2, AlertTriangle, BookOpen,
  TrendingDown, TrendingUp, Minus, Sparkles,
} from 'lucide-react';

interface WeaknessReport {
  id: number;
  sub_materi: { id: number; nama: string };
  mapel: { id: number; nama: string; kode: string };
  attempt_count: number;
  correct_count: number;
  accuracy_rate: number;
  is_flagged: boolean;
  last_seen?: string;
}

function AccuracyBar({ value }: { value: number }) {
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 progress-track">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold t-primary w-8 text-right">{value}%</span>
    </div>
  );
}

function StatusIcon({ accuracy }: { accuracy: number }) {
  if (accuracy >= 70) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (accuracy >= 50) return <Minus className="h-4 w-4 text-amber-500" />;
  return <TrendingDown className="h-4 w-4 text-red-500" />;
}

function EmptyWeakness() {
  return (
    <div className="flex flex-col items-center py-20 text-center space-y-4">
      <div className="text-6xl">📊</div>
      <h2 className="text-xl font-bold t-primary">Belum Ada Data Kelemahan</h2>
      <p className="text-sm t-muted max-w-xs">
        Kerjakan latihan soal dulu, dan AI akan otomatis memetakan kelemahanmu berdasarkan pola jawaban.
      </p>
      <Link href="/latihan">
        <Button variant="gradient" size="md">
          <BookOpen className="h-4 w-4" /> Mulai Latihan
        </Button>
      </Link>
    </div>
  );
}

export default function WeaknessPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['weakness'],
    queryFn: () => weaknessApi.getAll(),
    staleTime: 60_000,
  });

  const reports: WeaknessReport[] = data?.data?.data ?? [];

  const grouped = reports.reduce<Record<string, WeaknessReport[]>>((acc, r) => {
    const key = r.mapel.kode;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const kritis = reports.filter(r => r.is_flagged);
  const avgAcc = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + r.accuracy_rate, 0) / reports.length)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1,2,3].map(i => <Card key={i}><Skeleton className="h-20" /></Card>)}
        </div>
        <Card><Skeleton className="h-64" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📊 Analisis Kelemahanku"
        description="AI memetakan sub-materi yang perlu kamu fokuskan berdasarkan pola jawaban"
        action={
          reports.length > 0 ? (
            <Link href="/latihan">
              <Button variant="gradient" size="sm">
                <BookOpen className="h-4 w-4" /> Latihan Lagi
              </Button>
            </Link>
          ) : undefined
        }
      />

      {reports.length === 0 ? (
        <EmptyWeakness />
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs uppercase tracking-wider t-muted">Sub-materi Dipelajari</p>
              <p className="mt-2 text-3xl font-black t-primary">{reports.length}</p>
              <p className="mt-0.5 text-xs t-muted">dari semua mapel SNBT</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider t-muted">Akurasi Rata-rata</p>
              <p className="mt-2 text-3xl font-black" style={{ color: avgAcc >= 70 ? '#10b981' : avgAcc >= 50 ? '#f59e0b' : '#ef4444' }}>
                {avgAcc}%
              </p>
              <p className="mt-0.5 text-xs t-muted">
                {avgAcc >= 70 ? 'Bagus! Pertahankan' : avgAcc >= 50 ? 'Perlu ditingkatkan' : 'Butuh perhatian lebih'}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider t-muted">Kelemahan Kritis</p>
              <p className="mt-2 text-3xl font-black text-red-500">{kritis.length}</p>
              <p className="mt-0.5 text-xs t-muted">akurasi di bawah 60%</p>
            </Card>
          </div>

          {/* Critical weaknesses alert */}
          {kritis.length > 0 && (
            <Card style={{ borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.04)' }}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold t-primary">⚠️ Fokus di Sini Dulu!</p>
                  <p className="mt-0.5 text-xs t-muted">{kritis.length} sub-materi dengan akurasi di bawah 60% — perlu perhatian segera</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {kritis.slice(0, 5).map(k => (
                      <span key={k.id} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-red-500"
                        style={{ backgroundColor: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <span className={cn('rounded px-1 py-0.5 text-[9px] font-bold', getMapelColor(k.mapel.kode))}>{k.mapel.kode}</span>
                        {k.sub_materi.nama}
                        <span className="font-bold">· {k.accuracy_rate}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Per mapel breakdown */}
          {Object.entries(grouped).map(([kode, items]) => {
            const mapel = items[0].mapel;
            const mapelAvg = Math.round(items.reduce((s, r) => s + r.accuracy_rate, 0) / items.length);
            const mapelAttempts = items.reduce((s, r) => s + r.attempt_count, 0);

            return (
              <Card key={kode}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded px-2 py-1 text-xs font-bold', getMapelColor(kode))}>{kode}</span>
                    <span className="font-semibold t-primary">{mapel.nama}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs t-muted">
                    <StatusIcon accuracy={mapelAvg} />
                    <span className="font-bold" style={{ color: mapelAvg >= 70 ? '#10b981' : mapelAvg >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {mapelAvg}%
                    </span>
                    <span>· {mapelAttempts} soal</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {items
                    .sort((a, b) => a.accuracy_rate - b.accuracy_rate)
                    .map((r) => (
                      <div key={r.id} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {r.is_flagged && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                            <span className="truncate text-sm t-secondary">{r.sub_materi.nama}</span>
                          </div>
                          <span className="shrink-0 text-xs t-muted">{r.attempt_count} soal</span>
                        </div>
                        <AccuracyBar value={r.accuracy_rate} />
                      </div>
                    ))}
                </div>
              </Card>
            );
          })}

          {/* Tips card */}
          <Card style={{ borderColor: 'var(--primary-border)', backgroundColor: 'var(--primary-muted)' }}>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
              <div>
                <p className="font-semibold t-primary">Tips AI Lolos PTN</p>
                <p className="mt-1 text-xs t-muted leading-relaxed">
                  Fokus pada sub-materi dengan akurasi di bawah 60% dulu. Setelah mencapai 70%+ di semua sub-materi,
                  lanjutkan ke simulasi ujian penuh. Konsistensi latihan harian lebih efektif dari belajar marathon sesekali.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
