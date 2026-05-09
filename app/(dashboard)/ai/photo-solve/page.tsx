'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Camera, Zap, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function PhotoSolvePage() {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [result, setResult]     = useState<any>(null);

  const solveMutation = useMutation({
    mutationFn: (formData: FormData) => aiApi.photoSolve(formData),
    onSuccess: (res) => {
      setResult(res.data.data);
      toast.success('Soal berhasil dianalisis!');
    },
    onError: () => toast.error('Gagal menganalisis gambar. Pastikan foto jelas.'),
  });

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleSolve() {
    if (!file) { toast.error('Pilih gambar terlebih dahulu.'); return; }
    const fd = new FormData();
    fd.append('image', file);
    solveMutation.mutate(fd);
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setResult(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="📸 Foto ke Soal"
        description="Foto soal dari buku atau kertas — AI langsung menganalisis dan menjelaskan langkah penyelesaiannya"
      />

      {/* Upload area */}
      <div
        className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.04)] p-10 cursor-pointer hover:border-[rgba(99,102,241,0.5)] transition-colors"
        onClick={() => !preview && fileRef.current?.click()}
      >
        <input
          ref={fileRef} type="file" hidden accept="image/jpg,image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="relative w-full max-w-lg">
            <img src={preview} alt="Preview soal" className="rounded-xl w-full max-h-72 object-contain" />
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="absolute top-2 right-2 rounded-full bg-[rgba(0,0,0,0.6)] p-1.5 text-white hover:bg-[rgba(239,68,68,0.7)] transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Camera className="h-12 w-12 text-[#6366f1]" />
            <div className="text-center">
              <p className="font-medium text-[#94a3b8]">Klik atau drag foto soal ke sini</p>
              <p className="text-xs text-[#475569] mt-1">JPG, PNG, WEBP · Maks 5MB · Pastikan teks terbaca jelas</p>
            </div>
          </>
        )}
      </div>

      {preview && !result && (
        <Button variant="gradient" size="lg" className="w-full" onClick={handleSolve} isLoading={solveMutation.isPending}>
          <Zap className="h-4 w-4" />
          Analisis dengan AI
        </Button>
      )}

      {/* Loading skeleton */}
      {solveMutation.isPending && (
        <div className="space-y-3 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#141428] p-6">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Detected soal */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#141428] p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#a5b4fc]">📖 Soal Terdeteksi</h2>
            <p className="text-sm text-[#f1f5f9] leading-relaxed whitespace-pre-line">{result.soal_terdeteksi}</p>
            {result.mapel && (
              <span className="mt-2 inline-block rounded px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300">
                {result.mapel}
              </span>
            )}
          </div>

          {/* Strategi */}
          <div className="rounded-2xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.06)] p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#6366f1]">💡 Strategi Penyelesaian</h2>
            <div className="space-y-1.5 text-sm text-[#94a3b8]">
              <p><span className="font-medium text-[#f1f5f9]">Konsep:</span> {result.strategi?.konsep}</p>
              {result.strategi?.rumus && <p><span className="font-medium text-[#f1f5f9]">Rumus:</span> {result.strategi.rumus}</p>}
              <p><span className="font-medium text-[#f1f5f9]">Tips cepat:</span> {result.strategi?.tips_cepat}</p>
            </div>
          </div>

          {/* Langkah */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#141428] p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#f1f5f9]">📝 Langkah Penyelesaian</h2>
            <ol className="space-y-2">
              {result.eksekusi?.langkah?.map((l: any) => (
                <li key={l.no} className="flex gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(99,102,241,0.2)] text-[10px] font-bold text-[#a5b4fc] mt-0.5">
                    {l.no}
                  </span>
                  <span className="text-[#94a3b8]">
                    {l.aksi}{l.hasil && <span className="ml-1 font-medium text-[#10b981]">= {l.hasil}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Cara cepat */}
          {result.output?.cara_cepat && (
            <div className="rounded-2xl border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.06)] p-5">
              <h2 className="mb-2 text-sm font-semibold text-[#06b6d4]">⚡ Cara Cepat</h2>
              <p className="text-sm text-[#94a3b8]">{result.output.cara_cepat}</p>
              {result.output?.jawaban_akhir && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.25)] px-3 py-1.5">
                  <span className="text-sm font-bold text-[#34d399]">Jawaban: {result.output.jawaban_akhir}</span>
                </div>
              )}
            </div>
          )}

          <Button variant="secondary" size="md" onClick={handleReset} className="w-full">
            <RotateCcw className="h-4 w-4" /> Analisis Soal Baru
          </Button>
        </div>
      )}
    </div>
  );
}
