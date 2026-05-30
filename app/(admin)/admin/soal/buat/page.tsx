'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const LABELS = ['A', 'B', 'C', 'D', 'E'];

const TA = "w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all resize-none";
const SEL = "w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#f1f5f9] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all";
const LBL = "block text-sm font-semibold text-[#94a3b8] mb-2";

interface Pilihan { label: string; konten: string; }

export default function BuatSoalPage() {
  const router = useRouter();

  // Form state
  const [mapelId, setMapelId]     = useState('');
  const [subMateriId, setSubMateriId] = useState('');
  const [konten, setKonten]       = useState('');
  const [tipe, setTipe]           = useState('MC');
  const [kesulitan, setKesulitan] = useState('mudah');
  const [pembahasan, setPembahasan] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [kunci, setKunci]         = useState('A');
  const [pilihan, setPilihan]     = useState<Pilihan[]>([
    { label: 'A', konten: '' }, { label: 'B', konten: '' },
    { label: 'C', konten: '' }, { label: 'D', konten: '' },
  ]);

  const { data: mapelData } = useQuery({
    queryKey: ['mapel-list'],
    queryFn: () => adminApi.mapelList(),
    staleTime: 60_000,
  });
  const mapels: any[] = mapelData?.data?.data ?? [];

  const { data: subMateriData } = useQuery({
    queryKey: ['admin-sub-materi', mapelId],
    queryFn: () => adminApi.subMateri(Number(mapelId)),
    enabled: !!mapelId,
    staleTime: 30_000,
  });
  const subMateris: any[] = subMateriData?.data?.data ?? [];

  const mut = useMutation({
    mutationFn: (d: any) => adminApi.createSoal(d),
    onSuccess: () => {
      toast.success('Soal berhasil dibuat!');
      router.push('/admin/soal');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal membuat soal.'),
  });

  const addPilihan = () => {
    if (pilihan.length >= 5) return;
    setPilihan(p => [...p, { label: LABELS[p.length], konten: '' }]);
  };

  const removePilihan = (i: number) => {
    if (pilihan.length <= 4) { toast.error('Minimal 4 pilihan jawaban.'); return; }
    const updated = pilihan.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, label: LABELS[idx] }));
    setPilihan(updated);
    if (!updated.find(p => p.label === kunci)) setKunci(updated[0].label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelId)    { toast.error('Pilih mata pelajaran.'); return; }
    if (!subMateriId){ toast.error('Pilih sub-materi.'); return; }
    if (!konten.trim()){ toast.error('Tulis pertanyaan soal.'); return; }
    if (pilihan.some(p => !p.konten.trim())) { toast.error('Semua pilihan harus diisi.'); return; }
    mut.mutate({
      mapel_id: Number(mapelId),
      sub_materi_id: Number(subMateriId),
      konten, tipe, tingkat_kesulitan: kesulitan,
      pilihan, kunci,
      pembahasan: pembahasan || null,
      is_published: isPublished,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/soal"
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:border-[rgba(99,102,241,0.5)] transition-all">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">➕ Tambah Soal Manual</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Buat soal baru secara manual — tanpa AI</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Metadata */}
        <Card>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">1</span>
            Informasi Soal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LBL}>Mata Pelajaran *</label>
              <select value={mapelId} onChange={e => { setMapelId(e.target.value); setSubMateriId(''); }} required className={SEL}>
                <option value="">— Pilih Mapel —</option>
                {mapels.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.kode} — {m.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LBL}>Sub-Materi *</label>
              <select value={subMateriId} onChange={e => setSubMateriId(e.target.value)} required disabled={!mapelId} className={SEL + (!mapelId ? ' opacity-40 cursor-not-allowed' : '')}>
                <option value="">— Pilih Sub-Materi —</option>
                {subMateris.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.nama} ({s.soal_count ?? 0} soal)</option>
                ))}
              </select>
              {!mapelId && <p className="mt-1.5 text-xs text-[#475569]">Pilih mapel terlebih dahulu</p>}
            </div>
            <div>
              <label className={LBL}>Tipe Soal</label>
              <div className="flex gap-2">
                {[{ v: 'MC', l: '📝 Pilihan Ganda' }, { v: 'BS', l: '✅ Benar/Salah' }, { v: 'MJ', l: '🔗 Menjodohkan' }].map(t => (
                  <button key={t.v} type="button"
                    onClick={() => setTipe(t.v)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${tipe === t.v ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-[rgba(255,255,255,0.08)] text-[#64748b] hover:border-[rgba(255,255,255,0.15)]'}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LBL}>Tingkat Kesulitan</label>
              <div className="flex gap-2">
                {[{ v: 'mudah', l: '🟢 Mudah', c: 'emerald' }, { v: 'sedang', l: '🟡 Sedang', c: 'amber' }, { v: 'sulit', l: '🔴 Sulit', c: 'red' }].map(k => (
                  <button key={k.v} type="button"
                    onClick={() => setKesulitan(k.v)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${kesulitan === k.v
                      ? k.v === 'mudah' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                        : k.v === 'sedang' ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-red-500 bg-red-500/15 text-red-300'
                      : 'border-[rgba(255,255,255,0.08)] text-[#64748b] hover:border-[rgba(255,255,255,0.15)]'}`}>
                    {k.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Pertanyaan */}
        <Card>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">2</span>
            Pertanyaan
          </h2>
          <div>
            <label className={LBL}>Teks Soal *</label>
            <textarea value={konten} onChange={e => setKonten(e.target.value)} rows={6} required
              placeholder="Tulis pertanyaan di sini. Gunakan teks biasa. Untuk soal matematika, Anda dapat menggunakan notasi seperti a² + b² = c²"
              className={TA} />
            <p className="mt-2 text-xs text-[#475569]">{konten.length} karakter</p>
          </div>
        </Card>

        {/* Section 3: Pilihan Jawaban */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">3</span>
              Pilihan Jawaban
            </h2>
            {pilihan.length < 5 && (
              <button type="button" onClick={addPilihan}
                className="flex items-center gap-1.5 rounded-xl border border-[rgba(99,102,241,0.3)] bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-all">
                <Plus className="h-3.5 w-3.5" /> Tambah Pilihan E
              </button>
            )}
          </div>

          <div className="space-y-3">
            {pilihan.map((p, i) => (
              <div key={i}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 transition-all ${kunci === p.label ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'}`}>
                {/* Radio */}
                <button type="button" onClick={() => setKunci(p.label)}
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${kunci === p.label ? 'border-emerald-500 bg-emerald-500' : 'border-[rgba(255,255,255,0.2)] hover:border-emerald-400'}`}>
                  {kunci === p.label && <CheckCircle className="h-4 w-4 text-white" />}
                </button>
                {/* Label */}
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black ${kunci === p.label ? 'bg-emerald-500 text-white' : 'bg-[rgba(255,255,255,0.06)] text-[#94a3b8]'}`}>
                  {p.label}
                </div>
                {/* Input */}
                <textarea value={p.konten}
                  onChange={e => setPilihan(prev => prev.map((x, j) => j === i ? { ...x, konten: e.target.value } : x))}
                  rows={2} placeholder={`Isi pilihan ${p.label}...`} required
                  className={TA + ' flex-1'} />
                {/* Delete */}
                {pilihan.length > 4 && (
                  <button type="button" onClick={() => removePilihan(i)}
                    className="mt-0.5 flex-shrink-0 rounded-lg p-1.5 text-[#475569] hover:bg-red-500/10 hover:text-red-400 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-300">
              Kunci jawaban: <span className="font-bold">Pilihan {kunci}</span> — Klik lingkaran di sebelah kiri pilihan untuk mengubah.
            </p>
          </div>
        </Card>

        {/* Section 4: Pembahasan */}
        <Card>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">4</span>
            Pembahasan <span className="text-[#475569] font-normal text-sm">(opsional)</span>
          </h2>
          <textarea value={pembahasan} onChange={e => setPembahasan(e.target.value)} rows={5}
            placeholder="Tulis penjelasan jawaban yang benar. Pembahasan akan ditampilkan kepada siswa setelah menjawab soal..."
            className={TA} />
        </Card>

        {/* Section 5: Publish setting + Submit */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="sr-only" />
                <div onClick={() => setIsPublished(v => !v)}
                  className={`h-6 w-11 rounded-full border-2 transition-all cursor-pointer ${isPublished ? 'border-emerald-500 bg-emerald-500' : 'border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)]'}`}>
                  <div className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isPublished ? 'ml-5' : 'ml-0.5'}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Langsung Publish</p>
                <p className="text-xs text-[#64748b]">Soal akan langsung tersedia untuk latihan. Jika dimatikan, soal tersimpan sebagai draft.</p>
              </div>
            </label>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/admin/soal" className="flex-1 sm:flex-none">
                <Button type="button" variant="secondary" className="w-full sm:w-auto">Batal</Button>
              </Link>
              <Button type="submit" isLoading={mut.isPending} className="flex-1 sm:flex-none">
                {isPublished ? '🚀 Buat & Publish' : '💾 Simpan sebagai Draft'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
