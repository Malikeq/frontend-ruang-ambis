'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import Link from 'next/link';

const INPUT = "w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[rgba(99,102,241,0.3)] transition-all";
const LBL = "block text-sm font-semibold text-[#94a3b8] mb-2";

const GROUP_COLORS: Record<string, string> = {
  'AI':       'from-violet-500/20 to-indigo-500/20 border-violet-500/30',
  'Latihan':  'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'Analisis': 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  'Lainnya':  'from-amber-500/20 to-orange-500/20 border-amber-500/30',
};

const GROUP_ICONS: Record<string, string> = {
  'AI': '🤖', 'Latihan': '📝', 'Analisis': '📊', 'Lainnya': '⭐',
};

interface Props {
  pkg?: any; // for edit mode
}

// Toggle component
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} className="cursor-pointer">
      <div className={`relative h-6 w-11 rounded-full border-2 transition-all duration-300 ${value ? 'border-emerald-500 bg-emerald-500' : 'border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)]'}`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
    </div>
  );
}

export default function PackageFormPage({ pkg }: Props) {
  const router = useRouter();
  const isEdit = !!pkg;

  const [nama, setNama]         = useState(pkg?.nama ?? '');
  const [harga, setHarga]       = useState(pkg?.harga_idr ?? 49000);
  const [durasi, setDurasi]     = useState(pkg?.durasi_hari ?? 30);
  const [tier, setTier]         = useState(pkg?.tier ?? 'premium');
  const [isActive, setIsActive] = useState(pkg?.is_active ?? true);
  const [features, setFeatures] = useState<Record<string, any>>({});
  const [initialized, setInitialized] = useState(false);

  // Load feature definitions from API
  const { data: defData, isLoading: defLoading } = useQuery({
    queryKey: ['features-definition'],
    queryFn: () => adminApi.featuresDefinition(),
    staleTime: Infinity,
  });
  const defs: any[] = defData?.data?.data ?? [];

  // Initialize features from package or defaults
  useEffect(() => {
    if (defs.length === 0 || initialized) return;
    const init: Record<string, any> = {};
    defs.forEach(d => {
      init[d.key] = pkg?.fitur_json?.[d.key] ?? d.default;
    });
    setFeatures(init);
    setInitialized(true);
  }, [defs, pkg, initialized]);

  const setFeature = (key: string, val: any) => setFeatures(f => ({ ...f, [key]: val }));

  const mut = useMutation({
    mutationFn: (d: any) => isEdit
      ? adminApi.updatePackage(pkg.id, d)
      : adminApi.createPackage(d),
    onSuccess: () => {
      toast.success(isEdit ? 'Paket diperbarui!' : 'Paket berhasil dibuat!');
      router.push('/admin/packages');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal menyimpan.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) { toast.error('Nama paket wajib diisi.'); return; }
    mut.mutate({ nama, harga_idr: harga, durasi_hari: durasi, tier, is_active: isActive, fitur_json: features });
  };

  // Group features
  const groups = defs.reduce((acc: Record<string, any[]>, def: any) => {
    if (!acc[def.group]) acc[def.group] = [];
    acc[def.group].push(def);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/packages"
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:border-[rgba(99,102,241,0.5)] transition-all">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? `✏️ Edit Paket — ${pkg.nama}` : '💳 Buat Paket Baru'}
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">Konfigurasi fitur yang tersedia untuk paket ini</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">1</span>
            Informasi Dasar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={LBL}>Nama Paket *</label>
              <input value={nama} onChange={e => setNama(e.target.value)} required placeholder="Contoh: Premium Bulanan" className={INPUT} />
            </div>
            <div>
              <label className={LBL}>Harga (Rp)</label>
              <input type="number" value={harga} onChange={e => setHarga(Number(e.target.value))} min={0} className={INPUT} />
              <p className="mt-1.5 text-xs text-[#475569]">Rp {harga.toLocaleString('id')}</p>
            </div>
            <div>
              <label className={LBL}>Durasi (Hari)</label>
              <input type="number" value={durasi} onChange={e => setDurasi(Number(e.target.value))} min={1} className={INPUT} />
            </div>
            <div>
              <label className={LBL}>Tier</label>
              <div className="flex gap-2">
                {[{ v: 'premium', l: '⭐ Premium', c: 'indigo' }, { v: 'daily_pass', l: '⚡ Daily Pass', c: 'cyan' }].map(t => (
                  <button key={t.v} type="button" onClick={() => setTier(t.v)}
                    className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${tier === t.v
                      ? t.v === 'premium' ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                      : 'border-[rgba(255,255,255,0.08)] text-[#64748b] hover:border-[rgba(255,255,255,0.15)]'}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LBL}>Status Paket</label>
              <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
                <Toggle value={isActive} onChange={setIsActive} />
                <div>
                  <p className="text-sm font-semibold text-white">{isActive ? 'Aktif' : 'Nonaktif'}</p>
                  <p className="text-xs text-[#64748b]">{isActive ? 'Paket tampil dan bisa dibeli user' : 'Paket disembunyikan dari user'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Feature Flags */}
        {defLoading ? (
          <Card><p className="text-[#64748b] text-sm text-center py-8">Memuat definisi fitur...</p></Card>
        ) : (
          Object.entries(groups).map(([group, groupDefs]) => (
            <Card key={group} className={`bg-gradient-to-br border ${GROUP_COLORS[group] ?? 'border-[rgba(255,255,255,0.08)]'}`}>
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <span className="text-lg">{GROUP_ICONS[group] ?? '⚙️'}</span>
                {group}
                <span className="ml-auto text-xs text-[#475569] font-normal">
                  {groupDefs.filter((d: any) => {
                    const v = features[d.key];
                    return d.type === 'boolean' ? v === true : (v !== 0 && v !== false);
                  }).length}/{groupDefs.length} aktif
                </span>
              </h2>
              <div className="space-y-4">
                {(groupDefs as any[]).map((def: any) => (
                  <div key={def.key}
                    className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                      def.type === 'boolean'
                        ? features[def.key] ? 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]' : 'border-[rgba(255,255,255,0.04)] opacity-70'
                        : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]'
                    }`}>
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0 mt-0.5">{def.icon}</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{def.label}</p>
                        {def.hint && (
                          <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 text-[10px] text-[#475569]">{def.hint}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748b] mt-0.5">{def.desc}</p>

                      {/* Number input for limit features */}
                      {def.type === 'number' && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[-1, 0, 5, 10, 20, 30, 50, 100].map(v => (
                              <button key={v} type="button"
                                onClick={() => setFeature(def.key, v)}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${features[def.key] === v ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-[rgba(255,255,255,0.08)] text-[#475569] hover:border-[rgba(255,255,255,0.2)] hover:text-[#94a3b8]'}`}>
                                {v === -1 ? '∞' : v}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={features[def.key] ?? 0}
                              onChange={e => setFeature(def.key, Number(e.target.value))}
                              className="w-20 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-1 text-center text-sm text-[#f1f5f9] outline-none focus:border-[rgba(99,102,241,0.5)]"
                            />
                            {def.unit && <span className="text-xs text-[#475569]">{def.unit}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Toggle for boolean */}
                    {def.type === 'boolean' && (
                      <Toggle value={!!features[def.key]} onChange={v => setFeature(def.key, v)} />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}

        {/* Submit */}
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Simpan Konfigurasi</p>
              <p className="text-xs text-[#64748b] mt-0.5">
                {Object.values(features).filter(v => v === true || (typeof v === 'number' && v !== 0)).length} fitur aktif
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/packages"><Button type="button" variant="secondary">Batal</Button></Link>
              <Button type="submit" isLoading={mut.isPending}>
                <Save className="h-4 w-4" />
                {isEdit ? 'Simpan Perubahan' : 'Buat Paket'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
