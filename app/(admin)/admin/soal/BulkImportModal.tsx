'use client';
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { X, Upload, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface Props { onClose: () => void; }

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export default function BulkImportModal({ onClose }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: any[]; message: string } | null>(null);
  const [downloading, setDownloading] = useState(false);

  const importMut = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Pilih file CSV terlebih dahulu.');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('auto_publish', autoPublish ? '1' : '0');
      const res = await adminApi.bulkImportSoal(fd);
      return res.data;
    },
    onSuccess: (data: any) => {
      setResult(data);
      if (data.imported > 0) {
        toast.success(`${data.imported} soal berhasil diimport!`);
        qc.invalidateQueries({ queryKey: ['admin-soal'] });
      }
      if (data.failed?.length) toast.warning(`${data.failed.length} baris gagal. Cek detail di bawah.`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Import gagal.'),
  });

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const res = await adminApi.downloadSoalTemplate();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'template_soal.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Template CSV berhasil didownload!');
    } catch { toast.error('Gagal download template.'); }
    finally { setDownloading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) { setFile(f); setResult(null); }
    else toast.error('Hanya file CSV yang didukung.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0f172a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
          <h2 className="text-lg font-bold text-white">📥 Bulk Import Soal</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#475569] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 p-6">
          {/* Step 1: Download template */}
          <div className="rounded-xl border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.06)] p-4">
            <p className="text-sm font-semibold text-[#a5b4fc] mb-1">📋 Langkah 1 — Download Template</p>
            <p className="text-xs text-[#64748b] mb-3">
              Download template CSV, isi dengan soal-soal Anda, lalu upload kembali.
              Kolom: <code className="text-[#94a3b8]">mapel_kode, sub_materi_nama, tingkat_kesulitan, tipe, konten, pilihan_A–E, kunci, pembahasan</code>
            </p>
            <Button variant="secondary" size="sm" onClick={handleDownloadTemplate} isLoading={downloading}>
              <Download className="h-4 w-4 mr-1.5" /> Download template_soal.csv
            </Button>
          </div>

          {/* Step 2: Upload */}
          <div>
            <p className="text-sm font-semibold text-[#94a3b8] mb-2">📤 Langkah 2 — Upload File CSV</p>
            <div
              onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.1)] hover:border-[rgba(99,102,241,0.5)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(99,102,241,0.04)] transition-all p-8 flex flex-col items-center gap-3 text-center"
            >
              <Upload className="h-8 w-8 text-[#475569]" />
              {file ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <p className="text-sm font-semibold text-[#f1f5f9]">{file.name}</p>
                  <p className="text-xs text-[#475569]">({(file.size / 1024).toFixed(1)} KB)</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#94a3b8]">Drag & drop file CSV di sini, atau klik untuk browse</p>
                  <p className="text-xs text-[#475569]">Maksimal 5MB · Format: .csv</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setResult(null); } }} />
          </div>

          {/* Options */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={autoPublish} onChange={e => setAutoPublish(e.target.checked)} className="h-4 w-4 accent-indigo-500 rounded" />
            <span className="text-sm text-[#94a3b8]">Langsung publish semua soal yang diimport</span>
          </label>

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
              <div className="flex items-center gap-3">
                {result.imported > 0 && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">{result.imported} soal berhasil</span>
                  </div>
                )}
                {result.failed?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">{result.failed.length} baris gagal</span>
                  </div>
                )}
              </div>
              {result.failed?.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.failed.map((f: any, i: number) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="text-[#475569] font-mono">Baris {f.row}:</span>
                      <span className="text-red-400">{f.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <Button variant="secondary" onClick={onClose}>Tutup</Button>
            <Button onClick={() => importMut.mutate()} isLoading={importMut.isPending} disabled={!file}>
              <Upload className="h-4 w-4 mr-1.5" /> Import Sekarang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
