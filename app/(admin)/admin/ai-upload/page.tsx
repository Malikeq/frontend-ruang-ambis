'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Upload, FileText, CheckCircle2, XCircle,
  Clock, RefreshCw, Sparkles, AlertCircle,
  BookOpen, Loader2, ChevronRight, RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const ACCEPTED = '.pdf,.docx,.txt,.md,.jpg,.jpeg,.png';

// ── Mapel pill colours (fallback if not from API) ──────────────────────────
const MAPEL_COLORS: Record<string, string> = {
  PU:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
  PM:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  LBI:  'bg-green-500/20 text-green-300 border-green-500/30',
  LBE:  'bg-sky-500/20 text-sky-300 border-sky-500/30',
  KMBM: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  PK:   'bg-orange-500/20 text-orange-300 border-orange-500/30',
  PPU:  'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    processing: { variant: 'warning', label: '⏳ Memproses AI...' },
    done:       { variant: 'success', label: '✅ Selesai' },
    failed:     { variant: 'error',   label: '❌ Gagal' },
  };
  const s = map[status] ?? { variant: 'default', label: status };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// ── Upload row with live status polling ────────────────────────────────────
function UploadRow({ upload: u, onDone }: { upload: any; onDone: () => void }) {
  const [liveStatus, setLiveStatus] = useState(u.status);
  const [draftCount, setDraftCount] = useState<number | null>(u.drafts_count ?? null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setLiveStatus(u.status); }, [u.status]);

  // Poll while processing
  useEffect(() => {
    if (liveStatus !== 'processing') return;
    pollRef.current = setInterval(async () => {
      try {
        const res  = await adminApi.uploadStatus(u.id);
        const data = res.data?.data;
        if (data?.upload?.status && data.upload.status !== 'processing') {
          setLiveStatus(data.upload.status);
          setDraftCount(data.draft_count ?? 0);
          clearInterval(pollRef.current!);
          onDone();
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStatus, u.id]);

  const retryMut = useMutation({
    mutationFn: () => adminApi.retryUpload(u.id),
    onSuccess: () => {
      toast.success('Upload dijadwalkan ulang!');
      setLiveStatus('processing');
      setDraftCount(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Gagal retry.'),
  });

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        liveStatus === 'done'        ? 'bg-emerald-500/15'
          : liveStatus === 'failed'  ? 'bg-red-500/15'
          : 'bg-indigo-500/15',
      )}>
        {liveStatus === 'processing' ? (
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
        ) : liveStatus === 'done' ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-[#f1f5f9]">{u.filename}</p>
        <p className="text-xs text-[#64748b] mt-0.5">
          {u.jumlah_soal_target} soal target · {formatDate(u.created_at)}
          {draftCount !== null && liveStatus === 'done' && (
            <span className="ml-2 text-emerald-400 font-medium">· {draftCount} draft dibuat</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={liveStatus} />
        {liveStatus === 'done' && (
          <Link href={ROUTES.admin.aiDrafts}>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Review <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </Link>
        )}
        {(liveStatus === 'failed') && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs"
            onClick={() => retryMut.mutate()}
            isLoading={retryMut.isPending}
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminAiUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const qc      = useQueryClient();

  const [file, setFile]         = useState<File | null>(null);
  const [jumlah, setJumlah]     = useState(10);
  const [mapelIds, setMapelIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // ── Fetch real mapel list from DB ──────────────────────────────────────
  const { data: mapelData, isLoading: loadingMapel } = useQuery({
    queryKey: ['admin-mapel-list'],
    queryFn:  () => adminApi.mapelList(),
    staleTime: Infinity,
  });
  const mapels: Array<{ id: number; nama: string; kode: string }> =
    mapelData?.data?.data ?? [];

  // ── Upload history ─────────────────────────────────────────────────────
  const { data: histData, isLoading: loadingHist, refetch } = useQuery({
    queryKey: ['upload-history'],
    queryFn:  () => adminApi.uploadHistory(),
    staleTime: 30_000,
  });
  const history: any[] = histData?.data?.data?.data ?? [];

  // ── Upload mutation ────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Pilih file dulu!');
      if (mapelIds.length === 0) throw new Error('Pilih minimal 1 mapel target!');

      const fd = new FormData();
      fd.append('file', file);
      fd.append('target_mapel_ids', JSON.stringify(mapelIds));
      fd.append('jumlah_soal_target', String(jumlah));
      return adminApi.aiUpload(fd);
    },
    onSuccess: (res) => {
      const uploadName = res.data?.data?.filename ?? file?.name ?? 'File';
      toast.success(`"${uploadName}" berhasil diupload! AI sedang membuat soal...`);
      setFile(null);
      setMapelIds([]);
      qc.invalidateQueries({ queryKey: ['upload-history'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Upload gagal.';
      toast.error(msg);
    },
  });

  // ── Toggle mapel selection ─────────────────────────────────────────────
  const toggleMapel = (id: number) =>
    setMapelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selectAll = () => setMapelIds(mapels.map(m => m.id));
  const clearAll  = () => setMapelIds([]);

  // ── Drag-and-drop handlers ─────────────────────────────────────────────
  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const canSubmit = !!file && mapelIds.length > 0 && !uploadMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="📤 Upload Materi AI"
        description="Upload PDF, DOCX, gambar, atau teks — AI akan generate soal SNBT secara otomatis"
      />

      {/* ── Upload form ─────────────────────────────────────────────────── */}
      <Card>
        <h2 className="mb-5 font-semibold text-[#f1f5f9] flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-[#6366f1]" />
          Generate Soal dari Materi
        </h2>

        {/* Drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !file && fileRef.current?.click()}
          className={cn(
            'mb-5 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer',
            isDragging
              ? 'border-[rgba(99,102,241,0.7)] bg-[rgba(99,102,241,0.1)] scale-[1.01]'
              : file
              ? 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.04)]'
              : 'border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.04)] hover:border-[rgba(99,102,241,0.55)] hover:bg-[rgba(99,102,241,0.07)]',
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(16,185,129,0.15)]">
                <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#f1f5f9]">{file.name}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="text-xs text-red-400 hover:underline"
              >
                Ganti file
              </button>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(99,102,241,0.12)]">
                <Upload className="h-7 w-7 text-[#6366f1]" />
              </div>
              <div className="text-center">
                <p className="font-medium text-[#94a3b8]">
                  {isDragging ? 'Lepaskan file di sini...' : 'Klik atau drag file ke sini'}
                </p>
                <p className="text-xs text-[#475569] mt-1">PDF, DOCX, TXT, MD, JPG, PNG · Maks 20MB</p>
              </div>
            </>
          )}
        </div>

        {/* Mapel selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-medium text-[#94a3b8]">
              Target Mapel SNBT
              <span className={cn(
                'ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                mapelIds.length > 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-red-500/15 text-red-400',
              )}>
                {mapelIds.length > 0 ? `${mapelIds.length} dipilih` : 'Wajib pilih min. 1'}
              </span>
            </p>
            {mapels.length > 0 && (
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-indigo-400 hover:underline">Pilih Semua</button>
                <span className="text-[#334155]">·</span>
                <button onClick={clearAll} className="text-xs text-[#64748b] hover:underline">Reset</button>
              </div>
            )}
          </div>

          {loadingMapel ? (
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)}
            </div>
          ) : mapels.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.07)] px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-400">Mapel belum ada di database. Pastikan seeder sudah dijalankan.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {mapels.map((m) => {
                const active     = mapelIds.includes(m.id);
                const colorClass = MAPEL_COLORS[m.kode] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMapel(m.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                      active
                        ? 'border-[rgba(99,102,241,0.6)] bg-[rgba(99,102,241,0.18)] text-[#a5b4fc] shadow-sm'
                        : 'border-[rgba(255,255,255,0.08)] text-[#64748b] hover:border-[rgba(99,102,241,0.3)] hover:text-[#94a3b8]',
                    )}
                  >
                    <span className={cn('rounded px-1 py-0.5 text-[10px] font-bold border', colorClass)}>
                      {m.kode}
                    </span>
                    {m.nama.split(' ').slice(0, 2).join(' ')}
                    {active && <CheckCircle2 className="h-3 w-3 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Jumlah soal */}
        <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-[#94a3b8] flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Jumlah Soal Target
            </span>
            <span className="font-bold text-[#a5b4fc] tabular-nums">{jumlah} soal</span>
          </div>
          <input
            type="range" min={5} max={50} step={5} value={jumlah}
            onChange={e => setJumlah(Number(e.target.value))}
            className="w-full accent-[#6366f1]"
          />
          <div className="flex justify-between text-[10px] text-[#475569] mt-1.5">
            <span>5</span>
            <span>50</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={() => uploadMutation.mutate()}
          isLoading={uploadMutation.isPending}
          disabled={!canSubmit}
        >
          {uploadMutation.isPending ? (
            <>Mengupload & Memulai AI...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Generate {jumlah} Soal dengan AI</>
          )}
        </Button>

        {/* Validation hints */}
        {!file && !uploadMutation.isPending && (
          <p className="mt-2 text-center text-xs text-[#475569]">⬆ Pilih file materi terlebih dahulu</p>
        )}
        {file && mapelIds.length === 0 && !uploadMutation.isPending && (
          <p className="mt-2 text-center text-xs text-amber-400">⚠ Pilih minimal 1 mapel target</p>
        )}
      </Card>

      {/* ── Upload history ──────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
          <h2 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#6366f1]" />
            Riwayat Upload
          </h2>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={loadingHist}>
            <RefreshCw className={cn('h-3.5 w-3.5', loadingHist && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {loadingHist ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(99,102,241,0.08)]">
              <FileText className="h-7 w-7 text-[#334155]" />
            </div>
            <p className="font-semibold text-[#f1f5f9]">Belum ada upload</p>
            <p className="text-sm text-[#64748b] mt-1">Upload materi pertamamu di atas!</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {history.map((u: any) => (
              <UploadRow key={u.id} upload={u} onDone={() => refetch()} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
