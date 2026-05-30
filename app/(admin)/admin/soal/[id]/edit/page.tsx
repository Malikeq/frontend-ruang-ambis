'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const LABELS = ['A', 'B', 'C', 'D', 'E'];
const TA = "w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all resize-none";
const SEL = "w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#f1f5f9] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all";
const LBL = "block text-sm font-semibold text-[#94a3b8] mb-2";

export default function EditSoalPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-soal-detail', id],
    queryFn: () => adminApi.showSoal(Number(id)),
    staleTime: 0,
  });
  const soal = data?.data?.data;

  // Form state (initialized from loaded soal)
  const [mapelId, setMapelId]     = useState('');
  const [subMateriId, setSubMateriId] = useState('');
  const [konten, setKonten]       = useState('');
  const [tipe, setTipe]           = useState('MC');
  const [kesulitan, setKesulitan] = useState('mudah');
  const [pembahasan, setPembahasan] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [kunci, setKunci]         = useState('A');
  const [pilihan, setPilihan]     = useState<{ label: string; konten: string }[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (soal && !initialized) {
      setMapelId(String(soal.mapel_id ?? ''));
      setSubMateriId(String(soal.sub_materi_id ?? ''));
      setKonten(soal.konten ?? '');
      setTipe(soal.tipe ?? 'MC');
      setKesulitan(soal.tingkat_kesulitan ?? 'mudah');
      setIsPublished(soal.is_published ?? false);
      const steps = soal.pembahasan?.langkah_langkah ?? [];
      setPembahasan(steps.map((s: any) => s.teks ?? '').filter(Boolean).join(' '));
      const pjs = soal.pilihan_jawaban ?? [];
      setPilihan(pjs.map((p: any) => ({ label: p.label, konten: p.konten })));
      const correct = pjs.find((p: any) => p.is_correct);
      if (correct) setKunci(correct.label);
      setInitialized(true);
    }
  }, [soal, initialized]);

  const { data: mapelData } = useQuery({ queryKey: ['mapel-list'], queryFn: () => adminApi.mapelList(), staleTime: 60_000 });
  const mapels: any[] = mapelData?.data?.data ?? [];

  const { data: subMateriData } = useQuery({
    queryKey: ['admin-sub-materi', mapelId],
    queryFn: () => adminApi.subMateri(Number(mapelId)),
    enabled: !!mapelId,
    staleTime: 30_000,
  });
  const subMateris: any[] = subMateriData?.data?.data ?? [];

  const saveMut = useMutation({
    mutationFn: (d: any) => adminApi.updateSoalFull(Number(id), d),
    onSuccess: () => { toast.success('Soal berhasil diperbarui!'); router.push('/admin/soal'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal menyimpan.'),
  });

  const publishMut = useMutation({
    mutationFn: () => adminApi.publishSoal(Number(id)),
    onSuccess: (res: any) => {
      setIsPublished(res?.data?.data?.is_published ?? !isPublished);
      toast.success('Status diubah!');
    },
  });

  const addPilihan = () => {
    if (pilihan.length >= 5) return;
    setPilihan(p => [...p, { label: LABELS[p.length], konten: '' }]);
  };

  const removePilihan = (i: number) => {
    if (pilihan.length <= 4) { toast.error('Minimal 4 pilihan.'); return; }
    const updated = pilihan.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, label: LABELS[idx] }));
    setPilihan(updated);
    if (!updated.find(p => p.label === kunci)) setKunci(updated[0].label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pilihan.some(p => !p.konten.trim())) { toast.error('Semua pilihan harus diisi.'); return; }
    saveMut.mutate({
      mapel_id: Number(mapelId),
      sub_materi_id: Number(subMateriId),
      konten, tipe, tingkat_kesulitan: kesulitan,
      pilihan, kunci,
      pembahasan: pembahasan || null,
      is_published: isPublished,
    });
  };

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-10 w-64" />
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-48" />)}
    </div>
  );

  if (!soal) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-5xl">❌</p>
      <p className="text-lg font-bold text-white">Soal tidak ditemukan</p>
      <Link href="/admin/soal"><Button variant="secondary">← Kembali</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/soal"
            className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:border-[rgba(99,102,241,0.5)] transition-all">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">✏️ Edit Soal #{id}</h1>
            <p className="text-sm text-[#64748b] mt-0.5">
              {soal.is_ai_generated ? '✨ Dibuat oleh AI' : '✎ Dibuat manual'}
              {' · '}
              <span className={isPublished ? 'text-emerald-400' : 'text-amber-400'}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={isPublished ? 'secondary' : 'gradient'}
          size="sm"
          isLoading={publishMut.isPending}
          onClick={() => publishMut.mutate()}>
          {isPublished ? <><EyeOff className="h-4 w-4" /> Unpublish</> : <><Eye className="h-4 w-4" /> Publish</>}
        </Button>
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
              <label className={LBL}>Mata Pelajaran</label>
              <select value={mapelId} onChange={e => { setMapelId(e.target.value); setSubMateriId(''); }} className={SEL}>
                <option value="">— Pilih Mapel —</option>
                {mapels.map((m: any) => <option key={m.id} value={m.id}>{m.kode} — {m.nama}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Sub-Materi</label>
              <select value={subMateriId} onChange={e => setSubMateriId(e.target.value)} disabled={!mapelId} className={SEL + (!mapelId ? ' opacity-40' : '')}>
                <option value="">— Pilih Sub-Materi —</option>
                {subMateris.map((s: any) => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Tipe Soal</label>
              <div className="flex gap-2">
                {[{ v: 'MC', l: '📝 Pilihan Ganda' }, { v: 'BS', l: '✅ Benar/Salah' }, { v: 'MJ', l: '🔗 Menjodohkan' }].map(t => (
                  <button key={t.v} type="button" onClick={() => setTipe(t.v)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${tipe === t.v ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-[rgba(255,255,255,0.08)] text-[#64748b] hover:border-[rgba(255,255,255,0.15)]'}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LBL}>Tingkat Kesulitan</label>
              <div className="flex gap-2">
                {[{ v: 'mudah', l: '🟢 Mudah' }, { v: 'sedang', l: '🟡 Sedang' }, { v: 'sulit', l: '🔴 Sulit' }].map(k => (
                  <button key={k.v} type="button" onClick={() => setKesulitan(k.v)}
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
          <textarea value={konten} onChange={e => setKonten(e.target.value)} rows={6} required placeholder="Teks soal..." className={TA} />
          <p className="mt-2 text-xs text-[#475569]">{konten.length} karakter</p>
        </Card>

        {/* Section 3: Pilihan */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">3</span>
              Pilihan Jawaban
            </h2>
            {pilihan.length < 5 && (
              <button type="button" onClick={addPilihan}
                className="flex items-center gap-1.5 rounded-xl border border-[rgba(99,102,241,0.3)] bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-all">
                <Plus className="h-3.5 w-3.5" /> Tambah Pilihan
              </button>
            )}
          </div>
          <div className="space-y-3">
            {pilihan.map((p, i) => (
              <div key={i}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 transition-all ${kunci === p.label ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'}`}>
                <button type="button" onClick={() => setKunci(p.label)}
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${kunci === p.label ? 'border-emerald-500 bg-emerald-500' : 'border-[rgba(255,255,255,0.2)] hover:border-emerald-400'}`}>
                  {kunci === p.label && <CheckCircle className="h-4 w-4 text-white" />}
                </button>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black ${kunci === p.label ? 'bg-emerald-500 text-white' : 'bg-[rgba(255,255,255,0.06)] text-[#94a3b8]'}`}>
                  {p.label}
                </div>
                <textarea value={p.konten}
                  onChange={e => setPilihan(prev => prev.map((x, j) => j === i ? { ...x, konten: e.target.value } : x))}
                  rows={2} placeholder={`Isi pilihan ${p.label}...`} className={TA + ' flex-1'} />
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
            <p className="text-sm text-emerald-300">Kunci jawaban: <span className="font-bold">Pilihan {kunci}</span></p>
          </div>
        </Card>

        {/* Section 4: Pembahasan */}
        <Card>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">4</span>
            Pembahasan <span className="text-[#475569] font-normal text-sm ml-1">(opsional)</span>
          </h2>
          <textarea value={pembahasan} onChange={e => setPembahasan(e.target.value)} rows={5}
            placeholder="Tulis penjelasan jawaban..." className={TA} />
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/soal">
            <Button type="button" variant="secondary">Batal</Button>
          </Link>
          <Button type="submit" isLoading={saveMut.isPending}>
            <Save className="h-4 w-4" /> Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
