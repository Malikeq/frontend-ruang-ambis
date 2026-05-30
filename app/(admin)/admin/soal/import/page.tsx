'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { ArrowLeft, Download, Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface FailedRow { row: number; reason: string; }

const CSV_COLUMNS = [
  { col: 'mapel_kode',       desc: 'Kode mapel (PU, PM, LBI, LBE, KMBM, PK, PPU)', required: true },
  { col: 'sub_materi_nama',  desc: 'Nama sub-materi. Dibuat otomatis jika belum ada', required: true },
  { col: 'tingkat_kesulitan',desc: 'mudah / sedang / sulit', required: true },
  { col: 'tipe',             desc: 'MC / BS / MJ', required: false },
  { col: 'konten',           desc: 'Teks pertanyaan soal', required: true },
  { col: 'pilihan_A',        desc: 'Teks pilihan A', required: true },
  { col: 'pilihan_B',        desc: 'Teks pilihan B', required: true },
  { col: 'pilihan_C',        desc: 'Teks pilihan C', required: true },
  { col: 'pilihan_D',        desc: 'Teks pilihan D', required: true },
  { col: 'pilihan_E',        desc: 'Teks pilihan E (opsional, boleh kosong)', required: false },
  { col: 'kunci',            desc: 'Huruf kunci jawaban: A / B / C / D / E', required: true },
  { col: 'pembahasan',       desc: 'Penjelasan jawaban (opsional, boleh kosong)', required: false },
];

export default function ImportSoalPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult]     = useState<{ imported: number; failed: FailedRow[]; message: string } | null>(null);
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
      if (data.imported > 0) toast.success(`${data.imported} soal berhasil diimport!`);
      if (data.failed?.length) toast.warning(`${data.failed.length} baris gagal.`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Import gagal.'),
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await adminApi.downloadSoalTemplate();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a'); a.href = url; a.download = 'template_soal.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Template berhasil didownload!');
    } catch { toast.error('Gagal download template.'); }
    finally { setDownloading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith('.csv') || f?.type === 'text/csv') { setFile(f); setResult(null); }
    else toast.error('Hanya file .csv yang didukung.');
  };

  const reset = () => { setFile(null); setResult(null); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/soal"
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:border-[rgba(99,102,241,0.5)] transition-all">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">📥 Bulk Import Soal</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Upload ratusan soal sekaligus via file CSV</p>
        </div>
      </div>

      {/* Step 1: Download Template */}
      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">1</span>
              Download Template CSV
            </h2>
            <p className="text-sm text-[#64748b] ml-9">
              Download template, isi dengan soal-soal Anda, lalu upload kembali.
            </p>
          </div>
          <Button variant="secondary" onClick={handleDownload} isLoading={downloading}>
            <Download className="h-4 w-4" /> Download template_soal.csv
          </Button>
        </div>

        {/* Column guide */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                <th className="px-4 py-2.5 text-left font-semibold text-[#475569]">Kolom</th>
                <th className="px-4 py-2.5 text-left font-semibold text-[#475569]">Keterangan</th>
                <th className="px-4 py-2.5 text-left font-semibold text-[#475569]">Wajib</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {CSV_COLUMNS.map(c => (
                <tr key={c.col} className="hover:bg-[rgba(255,255,255,0.01)]">
                  <td className="px-4 py-2.5 font-mono text-indigo-400">{c.col}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{c.desc}</td>
                  <td className="px-4 py-2.5">
                    {c.required
                      ? <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-400 font-semibold">Wajib</span>
                      : <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[#475569]">Opsional</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Example */}
        <div className="mt-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] p-4 overflow-x-auto">
          <p className="text-xs font-semibold text-[#475569] mb-2">Contoh isi CSV:</p>
          <pre className="text-xs text-[#94a3b8] whitespace-pre">{`mapel_kode,sub_materi_nama,tingkat_kesulitan,tipe,konten,pilihan_A,pilihan_B,pilihan_C,pilihan_D,pilihan_E,kunci,pembahasan
PU,Penalaran Analitik,mudah,MC,"Jika a=3 dan b=4, maka a²+b²=?",5,7,12,25,50,D,"a²+b² = 9+16 = 25"
PM,Aljabar,sedang,MC,"Nilai x untuk 2x+6=14 adalah?",2,3,4,5,6,C,"2x = 8, maka x = 4"`}</pre>
        </div>
      </Card>

      {/* Step 2: Upload */}
      <Card>
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">2</span>
          Upload File CSV
        </h2>

        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !file && fileRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 flex flex-col items-center gap-4 text-center transition-all ${dragOver ? 'border-indigo-500 bg-indigo-500/10' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.04)]'}`}>
          {file ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
                <FileText className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white">{file.name}</p>
                <p className="text-sm text-[#64748b] mt-1">{(file.size / 1024).toFixed(1)} KB · CSV</p>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); reset(); }}
                className="text-xs text-[#475569] underline hover:text-red-400 transition-colors">
                Ganti file
              </button>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)]">
                <Upload className="h-8 w-8 text-[#475569]" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#f1f5f9]">Drag & drop file CSV di sini</p>
                <p className="text-sm text-[#64748b] mt-1">atau klik untuk browse file</p>
              </div>
              <p className="text-xs text-[#475569]">Maksimal 5MB · Hanya .csv</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setResult(null); } }} />

        {/* Options */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
          <div className="relative cursor-pointer" onClick={() => setAutoPublish(v => !v)}>
            <div className={`h-6 w-11 rounded-full border-2 transition-all ${autoPublish ? 'border-emerald-500 bg-emerald-500' : 'border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)]'}`}>
              <div className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${autoPublish ? 'ml-5' : 'ml-0.5'}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Langsung publish semua soal</p>
            <p className="text-xs text-[#64748b]">Jika dimatikan, soal masuk sebagai Draft dan perlu dipublish manual</p>
          </div>
        </div>

        <div className="mt-5">
          <Button onClick={() => importMut.mutate()} isLoading={importMut.isPending} disabled={!file} className="w-full sm:w-auto">
            <Upload className="h-4 w-4" />
            {importMut.isPending ? 'Mengimport...' : 'Mulai Import'}
          </Button>
        </div>
      </Card>

      {/* Step 3: Results */}
      {result && (
        <Card>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">3</span>
            Hasil Import
          </h2>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-3xl font-black text-emerald-400">{result.imported}</p>
              <p className="text-xs text-[#64748b] mt-1 font-semibold">Berhasil Diimport</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-3xl font-black text-red-400">{result.failed?.length ?? 0}</p>
              <p className="text-xs text-[#64748b] mt-1 font-semibold">Baris Gagal</p>
            </div>
            <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4 text-center">
              <p className="text-3xl font-black text-white">{result.imported + (result.failed?.length ?? 0)}</p>
              <p className="text-xs text-[#64748b] mt-1 font-semibold">Total Baris</p>
            </div>
          </div>

          {/* Failed rows detail */}
          {result.failed?.length > 0 && (
            <div>
              <p className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Daftar Baris Gagal
              </p>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] divide-y divide-[rgba(239,68,68,0.1)]">
                {result.failed.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-mono font-bold text-red-400 flex-shrink-0">
                      Baris {f.row}
                    </span>
                    <span className="text-sm text-[#fca5a5]">{f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.imported > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300">{result.imported} soal berhasil masuk ke bank soal!</p>
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Button variant="secondary" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> Import Lagi
            </Button>
            <Link href="/admin/soal">
              <Button>Lihat Bank Soal →</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
