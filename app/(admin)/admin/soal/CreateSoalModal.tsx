'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { X, Plus, Trash2 } from 'lucide-react';


const INPUT = "w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] transition-all";
const LABEL = "block text-xs font-semibold text-[#94a3b8] mb-1.5";

interface Props { soal?: any; onClose: () => void; }

export default function CreateSoalModal({ soal, onClose }: Props) {
  const qc = useQueryClient();
  const isEdit = !!soal;

  const [mapelId, setMapelId] = useState(soal?.mapel_id ?? '');
  const [subMateriId, setSubMateriId] = useState(soal?.sub_materi_id ?? '');
  const [konten, setKonten] = useState(soal?.konten ?? '');
  const [tipe, setTipe] = useState(soal?.tipe ?? 'MC');
  const [kesulitan, setKesulitan] = useState(soal?.tingkat_kesulitan ?? 'mudah');
  const [pembahasan, setPembahasan] = useState(() => {
    const steps = soal?.pembahasan?.langkah_langkah ?? [];
    return steps.map((s: any) => s.teks ?? '').filter(Boolean).join(' ');
  });
  const [isPublished, setIsPublished] = useState(soal?.is_published ?? false);
  const [pilihan, setPilihan] = useState<{ label: string; konten: string }[]>(
    soal?.pilihan_jawaban?.length
      ? soal.pilihan_jawaban.map((p: any) => ({ label: p.label, konten: p.konten }))
      : [
          { label: 'A', konten: '' }, { label: 'B', konten: '' },
          { label: 'C', konten: '' }, { label: 'D', konten: '' },
        ]
  );
  const [kunci, setKunci] = useState(() => {
    if (soal?.pilihan_jawaban) {
      const c = soal.pilihan_jawaban.find((p: any) => p.is_correct);
      return c?.label ?? 'A';
    }
    return 'A';
  });

  const { data: mapelData } = useQuery({ queryKey: ['mapel-list'], queryFn: () => adminApi.mapelList(), staleTime: 60_000 });
  const mapels: any[] = mapelData?.data?.data ?? [];

  const { data: subMateriData } = useQuery({
    queryKey: ['admin-sub-materi', mapelId],
    queryFn: () => adminApi.subMateri(mapelId ? Number(mapelId) : undefined),
    enabled: !!mapelId,
    staleTime: 30_000,
  });
  const subMateris: any[] = subMateriData?.data?.data ?? [];

  const addPilihan = () => {
    const labels = ['A','B','C','D','E'];
    const next = labels[pilihan.length];
    if (next) setPilihan(p => [...p, { label: next, konten: '' }]);
  };
  const removePilihan = (i: number) => {
    if (pilihan.length <= 4) return;
    const updated = pilihan.filter((_, idx) => idx !== i);
    setPilihan(updated);
    if (!updated.find(p => p.label === kunci)) setKunci(updated[0]?.label ?? 'A');
  };

  const mut = useMutation({
    mutationFn: (d: any) => isEdit ? adminApi.updateSoalFull(soal.id, d) : adminApi.createSoal(d),
    onSuccess: () => {
      toast.success(isEdit ? 'Soal diperbarui!' : 'Soal berhasil dibuat!');
      qc.invalidateQueries({ queryKey: ['admin-soal'] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal menyimpan soal.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilihan.every(p => p.konten.trim())) { toast.error('Semua pilihan harus diisi.'); return; }
    mut.mutate({ mapel_id: Number(mapelId), sub_materi_id: Number(subMateriId), konten, tipe, tingkat_kesulitan: kesulitan, pilihan, kunci, pembahasan: pembahasan || null, is_published: isPublished });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0f172a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
          <h2 className="text-lg font-bold text-white">{isEdit ? '✏️ Edit Soal' : '➕ Tambah Soal Manual'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#475569] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Mapel + Sub-materi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Mata Pelajaran *</label>
              <select value={mapelId} onChange={e => { setMapelId(e.target.value); setSubMateriId(''); }} required className={INPUT + ' bg-[#0f172a]'}>
                <option value="">Pilih Mapel</option>
                {mapels.map((m: any) => <option key={m.id} value={m.id}>{m.kode} — {m.nama}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Sub-Materi *</label>
              <select value={subMateriId} onChange={e => setSubMateriId(e.target.value)} required className={INPUT + ' bg-[#0f172a]'}>
                <option value="">Pilih Sub-Materi</option>
                {subMateris.map((s: any) => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
          </div>

          {/* Konten */}
          <div>
            <label className={LABEL}>Pertanyaan *</label>
            <textarea value={konten} onChange={e => setKonten(e.target.value)} rows={4} required placeholder="Tulis soal di sini..." className={INPUT + ' resize-none'} />
          </div>

          {/* Tipe + Kesulitan + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Tipe</label>
              <select value={tipe} onChange={e => setTipe(e.target.value)} className={INPUT + ' bg-[#0f172a]'}>
                <option value="MC">MC – Pilihan Ganda</option>
                <option value="BS">BS – Benar/Salah</option>
                <option value="MJ">MJ – Menjodohkan</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Kesulitan</label>
              <select value={kesulitan} onChange={e => setKesulitan(e.target.value)} className={INPUT + ' bg-[#0f172a]'}>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="h-4 w-4 accent-indigo-500 rounded" />
                <span className="text-sm text-[#94a3b8]">Langsung Publish</span>
              </label>
            </div>
          </div>

          {/* Pilihan Jawaban */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={LABEL + ' mb-0'}>Pilihan Jawaban * <span className="text-[#475569] font-normal">(kunci: {kunci})</span></label>
              {pilihan.length < 5 && (
                <button type="button" onClick={addPilihan} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Plus className="h-3 w-3" /> Tambah
                </button>
              )}
            </div>
            <div className="space-y-2">
              {pilihan.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="kunci" checked={kunci === p.label} onChange={() => setKunci(p.label)}
                    className="h-4 w-4 accent-indigo-500 flex-shrink-0" title={`Pilih ${p.label} sebagai kunci`} />
                  <span className="w-6 text-center text-sm font-bold text-[#6366f1]">{p.label}</span>
                  <input value={p.konten} onChange={e => setPilihan(prev => prev.map((x, j) => j === i ? { ...x, konten: e.target.value } : x))}
                    placeholder={`Pilihan ${p.label}...`} required className={INPUT + ' flex-1'} />
                  {pilihan.length > 4 && (
                    <button type="button" onClick={() => removePilihan(i)} className="text-[#475569] hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-[#475569]">Klik radio button di kiri untuk menandai jawaban benar.</p>
          </div>

          {/* Pembahasan */}
          <div>
            <label className={LABEL}>Pembahasan (opsional)</label>
            <textarea value={pembahasan} onChange={e => setPembahasan(e.target.value)} rows={3}
              placeholder="Penjelasan jawaban yang benar..." className={INPUT + ' resize-none'} />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit" isLoading={mut.isPending}>{isEdit ? 'Simpan Perubahan' : 'Buat Soal'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
