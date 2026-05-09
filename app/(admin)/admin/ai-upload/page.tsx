'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MAPEL_LIST } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Upload, FileText, CheckCircle2, XCircle,
  Clock, RefreshCw, Sparkles,
} from 'lucide-react';

const ACCEPTED = '.pdf,.docx,.txt,.md,.jpg,.jpeg,.png';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: any; label: string }> = {
    processing: { v: 'warning', label: '⏳ Memproses...' },
    done:       { v: 'success', label: '✅ Selesai' },
    failed:     { v: 'error',   label: '❌ Gagal' },
  };
  const s = map[status] ?? { v: 'default', label: status };
  return <Badge variant={s.v}>{s.label}</Badge>;
}

export default function AdminAiUploadPage() {
  const fileRef   = useRef<HTMLInputElement>(null);
  const qc        = useQueryClient();
  const [file, setFile]         = useState<File | null>(null);
  const [jumlah, setJumlah]     = useState(10);
  const [mapelIds, setMapelIds] = useState<number[]>([]);

  const { data: histData, isLoading: loadingHist, refetch } = useQuery({
    queryKey: ['upload-history'],
    queryFn: () => adminApi.uploadHistory(),
    staleTime: 30_000,
  });

  const history: any[] = histData?.data?.data?.data ?? [];

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Pilih file dulu!');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target_mapel_ids', JSON.stringify(mapelIds.length ? mapelIds : [1]));
      fd.append('jumlah_soal_target', String(jumlah));
      return adminApi.aiUpload(fd);
    },
    onSuccess: () => {
      toast.success('File dikirim! AI sedang memproses...');
      setFile(null);
      qc.invalidateQueries({ queryKey: ['upload-history'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Upload gagal.'),
  });

  const toggleMapel = (idx: number) =>
    setMapelIds(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx]);

  return (
    <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="📤 Upload Materi AI"
          description="Upload PDF, DOCX, atau gambar — AI akan generate soal SNBT secara otomatis"
        />

        {/* Upload form */}
        <Card>
          <h2 className="mb-4 font-semibold text-[#f1f5f9] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#6366f1]" /> Generate Soal dari Materi
          </h2>

          {/* File picker */}
          <div
            onClick={() => !file && fileRef.current?.click()}
            className={cn(
              'mb-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer',
              file
                ? 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.04)]'
                : 'border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.04)] hover:border-[rgba(99,102,241,0.5)]',
            )}
          >
            <input
              ref={fileRef}
              type="file"
              hidden
              accept={ACCEPTED}
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-[#10b981]" />
                <div className="text-center">
                  <p className="font-semibold text-[#f1f5f9]">{file.name}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Ganti file
                </button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-[#6366f1]" />
                <div className="text-center">
                  <p className="font-medium text-[#94a3b8]">Klik atau drag file ke sini</p>
                  <p className="text-xs text-[#475569] mt-1">PDF, DOCX, TXT, MD, JPG, PNG · Maks 20MB</p>
                </div>
              </>
            )}
          </div>

          {/* Mapel targets */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-[#94a3b8]">
              Target Mapel <span className="text-[#475569] font-normal">(wajib pilih minimal 1)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {MAPEL_LIST.map((m, i) => {
                const idx = i + 1;
                const active = mapelIds.includes(idx);
                return (
                  <button
                    key={m.kode}
                    onClick={() => toggleMapel(idx)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      active
                        ? 'border-[rgba(99,102,241,0.5)] bg-[rgba(99,102,241,0.15)] text-[#a5b4fc]'
                        : 'border-[rgba(255,255,255,0.08)] text-[#64748b] hover:border-[rgba(99,102,241,0.3)]',
                    )}
                  >
                    <span className={cn('mr-1 rounded px-1 py-0.5 text-[10px]', m.colorClass)}>{m.kode}</span>
                    {m.nama.split(' ').slice(0, 2).join(' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jumlah soal slider */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-[#94a3b8]">Jumlah Soal Target</span>
              <span className="font-bold text-[#a5b4fc]">{jumlah} soal</span>
            </div>
            <input
              type="range" min={5} max={50} step={5} value={jumlah}
              onChange={e => setJumlah(Number(e.target.value))}
              className="w-full accent-[#6366f1]"
            />
            <div className="flex justify-between text-[10px] text-[#475569] mt-1">
              <span>5</span><span>50</span>
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={() => uploadMutation.mutate()}
            isLoading={uploadMutation.isPending}
            disabled={!file || mapelIds.length === 0}
          >
            <Sparkles className="h-4 w-4" />
            Generate {jumlah} Soal dengan AI
          </Button>
          {mapelIds.length === 0 && (
            <p className="mt-2 text-xs text-center text-[#f59e0b]">⚠️ Pilih minimal 1 mapel target</p>
          )}
        </Card>

        {/* Upload history */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
            <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#6366f1]" /> Riwayat Upload
            </h2>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {loadingHist ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="h-10 w-10 text-[#334155] mb-3" />
              <p className="font-semibold text-[#f1f5f9]">Belum ada upload</p>
              <p className="text-sm text-[#64748b] mt-1">Upload materi pertamamu di atas!</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {history.map((u: any) => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-4">
                  <FileText className="h-8 w-8 shrink-0 text-[#6366f1]" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-[#f1f5f9]">{u.filename}</p>
                    <p className="text-xs text-[#64748b]">
                      {u.jumlah_soal_target} soal · {formatDate(u.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
  );
}
