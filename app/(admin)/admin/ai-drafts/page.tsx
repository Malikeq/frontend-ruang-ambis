'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  RefreshCw, Pencil, Save, X, AlertTriangle,
  FileText, CheckSquare, Layers, Loader2,
} from 'lucide-react';

// ─── Edit Modal ────────────────────────────────────────────────────────────
function EditDraftModal({ draft, onClose }: { draft: any; onClose: () => void }) {
  const qc   = useQueryClient();
  const d    = draft.draft ?? {};
  const [form, setForm] = useState({
    pertanyaan:        d.pertanyaan        ?? '',
    pilihan:           d.pilihan           ?? { A: '', B: '', C: '', D: '', E: '' },
    kunci:             d.kunci             ?? 'A',
    pembahasan:        d.pembahasan        ?? '',
    sub_materi:        d.sub_materi        ?? '',
    tingkat_kesulitan: d.tingkat_kesulitan ?? 'sedang',
  });

  const saveMut = useMutation({
    mutationFn: () => adminApi.editDraft(draft.id, form),
    onSuccess: () => { toast.success('Draft diperbarui!'); qc.invalidateQueries({ queryKey: ['upload-drafts'] }); onClose(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#0f172a] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[#0f172a] px-6 py-4">
          <h3 className="font-bold text-[#f1f5f9] flex items-center gap-2"><Pencil className="h-4 w-4 text-indigo-400" /> Edit Draft</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-[#64748b]" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">Pertanyaan</label>
            <textarea rows={4} value={form.pertanyaan} onChange={e => setForm(f => ({ ...f, pertanyaan: e.target.value }))}
              className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3.5 py-3 text-sm text-[#f1f5f9] focus:border-indigo-500 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">Pilihan (klik huruf = set kunci)</label>
            <div className="space-y-2">
              {['A','B','C','D','E'].map(lbl => (
                <div key={lbl} className="flex gap-2 items-center">
                  <button onClick={() => setForm(f => ({ ...f, kunci: lbl }))}
                    className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-all',
                      form.kunci === lbl ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border-[rgba(255,255,255,0.08)] text-[#64748b]')}>
                    {lbl}
                  </button>
                  <input type="text" value={form.pilihan[lbl] ?? ''} onChange={e => setForm(f => ({ ...f, pilihan: { ...f.pilihan, [lbl]: e.target.value } }))}
                    className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#f1f5f9] focus:border-indigo-500 focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">Pembahasan</label>
            <textarea rows={3} value={form.pembahasan} onChange={e => setForm(f => ({ ...f, pembahasan: e.target.value }))}
              className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3.5 py-3 text-sm text-[#f1f5f9] focus:border-indigo-500 focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">Sub-materi</label>
              <input type="text" value={form.sub_materi} onChange={e => setForm(f => ({ ...f, sub_materi: e.target.value }))}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#f1f5f9] focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">Kesulitan</label>
              <select value={form.tingkat_kesulitan} onChange={e => setForm(f => ({ ...f, tingkat_kesulitan: e.target.value }))}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0f172a] px-3 py-2 text-sm text-[#f1f5f9] focus:border-indigo-500 focus:outline-none">
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 border-t border-[rgba(255,255,255,0.07)] bg-[#0f172a] px-6 py-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}><X className="h-4 w-4" /> Batal</Button>
          <Button variant="gradient" className="flex-1" onClick={() => saveMut.mutate()} isLoading={saveMut.isPending}>
            <Save className="h-4 w-4" /> Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Draft Row (inside a group) ─────────────────────────────────────
function DraftRow({ draft: d, selected, onToggle }: { draft: any; selected: boolean; onToggle: () => void }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing]   = useState(false);
  const data = d.draft ?? {};
  const pilihan: Record<string, string> = data.pilihan ?? {};
  const kunci = (data.kunci ?? '').toUpperCase();
  const isPending = d.status === 'pending';

  const approveMut = useMutation({
    mutationFn: () => adminApi.approveDraft(d.id),
    onSuccess: () => { toast.success('✅ Draft diapprove!'); qc.invalidateQueries({ queryKey: ['upload-drafts'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal.'),
  });
  const rejectMut = useMutation({
    mutationFn: () => adminApi.rejectDraft(d.id),
    onSuccess: () => { toast.success('Draft ditolak.'); qc.invalidateQueries({ queryKey: ['upload-drafts'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal.'),
  });

  return (
    <>
      {editing && <EditDraftModal draft={d} onClose={() => setEditing(false)} />}
      <div className={cn(
        'rounded-xl border transition-all duration-200',
        selected && isPending ? 'border-indigo-500/40 bg-[rgba(99,102,241,0.06)]' : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]',
        expanded && 'border-[rgba(99,102,241,0.25)] shadow-sm shadow-indigo-900/20',
      )}>
        {/* Clickable header row — click anywhere to expand/collapse */}
        <div
          className="flex items-start gap-3 p-4 cursor-pointer select-none"
          onClick={(e) => {
            // Don't toggle if clicking checkbox or edit button
            const tag = (e.target as HTMLElement).closest('input, button');
            if (!tag) setExpanded(v => !v);
          }}
        >
          {isPending && (
            <input type="checkbox" checked={selected}
              onClick={e => e.stopPropagation()}
              onChange={onToggle}
              className="mt-1 h-4 w-4 shrink-0 accent-indigo-500 cursor-pointer" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1.5">
              {data.mapel && <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">{data.mapel}</span>}
              {data.sub_materi && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#64748b]">{data.sub_materi}</span>}
              {data.tingkat_kesulitan && (
                <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize',
                  data.tingkat_kesulitan === 'mudah' ? 'bg-green-500/15 text-green-400'
                  : data.tingkat_kesulitan === 'sulit' ? 'bg-red-500/15 text-red-400'
                  : 'bg-yellow-500/15 text-yellow-400')}>
                  {data.tingkat_kesulitan}
                </span>
              )}
              <Badge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'error' : 'warning'}>
                {d.status === 'approved' ? '✅ Approved' : d.status === 'rejected' ? '❌ Ditolak' : '⏳ Pending'}
              </Badge>
            </div>
            {data.pertanyaan ? (
              <p className="text-sm text-[#e2e8f0] leading-relaxed line-clamp-2">{data.pertanyaan}</p>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Tidak ada pertanyaan
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isPending && (
              <button
                onClick={e => { e.stopPropagation(); setEditing(true); }}
                className="rounded-lg border border-[rgba(255,255,255,0.08)] p-1.5 text-[#64748b] hover:text-indigo-400 hover:border-indigo-500/40 transition-all"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-1.5 text-[#64748b]">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </div>
        </div>

        {/* Expanded: pilihan + pembahasan */}
        {expanded && (
          <div className="mt-3 space-y-2.5 border-t border-[rgba(255,255,255,0.05)] pt-3">
            {Object.keys(pilihan).length > 0 && (
              <div className="space-y-1.5">
                {Object.entries(pilihan).map(([lbl, txt]) => (
                  <div key={lbl} className={cn('flex gap-2 rounded-lg border p-2 text-xs',
                    lbl.toUpperCase() === kunci ? 'border-emerald-500/30 bg-emerald-500/08 text-emerald-300' : 'border-white/5 text-[#94a3b8]')}>
                    <span className="font-bold shrink-0">{lbl.toUpperCase()}.</span>
                    <span>{txt}</span>
                    {lbl.toUpperCase() === kunci && <CheckCircle className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                  </div>
                ))}
              </div>
            )}
            {data.pembahasan && (
              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/15 p-2.5">
                <p className="text-[10px] font-semibold text-indigo-300 mb-1">📖 Pembahasan</p>
                <p className="text-xs text-[#94a3b8]">{data.pembahasan}</p>
              </div>
            )}
            {/* Individual buttons */}
            {isPending && (
              <div className="flex gap-2 pt-1">
                <Button variant="danger" size="sm" className="flex-1 text-xs" onClick={() => rejectMut.mutate()} isLoading={rejectMut.isPending}>
                  <XCircle className="h-3.5 w-3.5" /> Tolak
                </Button>
                <Button variant="gradient" size="sm" className="flex-1 text-xs" onClick={() => approveMut.mutate()} isLoading={approveMut.isPending} disabled={!data.pertanyaan}>
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Upload Group Card ─────────────────────────────────────────────────────
function UploadGroup({ upload: u }: { upload: any }) {
  const qc = useQueryClient();
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const { data: draftsData, isLoading } = useQuery({
    queryKey: ['upload-drafts', u.id],
    queryFn:  () => adminApi.drafts({ upload_id: u.id, per_page: 100 }),
    enabled:  open,
    staleTime: 10_000,
  });
  const drafts: any[] = draftsData?.data?.data?.data ?? draftsData?.data?.data ?? [];
  const pending = drafts.filter(d => d.status === 'pending');
  const allPendingIds = pending.map(d => d.id);
  const allSelected = selected.length === allPendingIds.length && allPendingIds.length > 0;

  const toggleAll = () => setSelected(allSelected ? [] : allPendingIds);
  const toggleOne = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const bulkApproveMut = useMutation({
    mutationFn: (ids: number[]) => adminApi.bulkApproveDrafts(ids),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Selesai!');
      setSelected([]);
      qc.invalidateQueries({ queryKey: ['upload-drafts', u.id] });
      qc.invalidateQueries({ queryKey: ['upload-groups'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal bulk approve.'),
  });
  const bulkRejectMut = useMutation({
    mutationFn: (ids: number[]) => adminApi.bulkRejectDrafts(ids),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? 'Selesai!');
      setSelected([]);
      qc.invalidateQueries({ queryKey: ['upload-drafts', u.id] });
      qc.invalidateQueries({ queryKey: ['upload-groups'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal bulk reject.'),
  });

  const isBulking = bulkApproveMut.isPending || bulkRejectMut.isPending;

  return (
    <div className={cn('rounded-2xl border transition-all', open ? 'border-[rgba(99,102,241,0.3)]' : 'border-[rgba(255,255,255,0.07)]', 'bg-[#141428] overflow-hidden')}>
      {/* ── Group header ── */}
      <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,102,241,0.12)]">
          <FileText className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#f1f5f9] truncate">{u.filename}</p>
          <p className="text-xs text-[#64748b] mt-0.5">{formatDate(u.created_at)} · {u.drafts_count ?? 0} soal total</p>
        </div>
        {/* Status counters + quick action */}
        <div className="flex items-center gap-2 shrink-0">
          {(u.pending_count ?? 0) > 0 && (
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              {u.pending_count} pending
            </span>
          )}
          {(u.approved_count ?? 0) > 0 && (
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              {u.approved_count} ✓
            </span>
          )}
          {(u.rejected_count ?? 0) > 0 && (
            <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-semibold text-red-400">
              {u.rejected_count} ✗
            </span>
          )}
          {/* Approve All Group button — only when open and has pending */}
          {open && allPendingIds.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); bulkApproveMut.mutate(allPendingIds); }}
              disabled={isBulking}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {bulkApproveMut.isPending
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <CheckSquare className="h-3 w-3" />
              }
              Approve Semua ({allPendingIds.length})
            </button>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-[#64748b]" /> : <ChevronDown className="h-4 w-4 text-[#64748b]" />}
        </div>
      </button>

      {/* ── Expanded draft list ── */}
      {open && (
        <div className="border-t border-[rgba(255,255,255,0.06)] px-4 pb-4 pt-3 space-y-3">
          {/* Bulk action bar (only shown when there are pending drafts) */}
          {allPendingIds.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.06)] px-4 py-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[#94a3b8] select-none">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-indigo-500" />
                {allSelected ? 'Batalkan pilihan' : `Pilih semua ${allPendingIds.length} pending`}
              </label>
              {selected.length > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-indigo-300 font-semibold">{selected.length} dipilih</span>
                  <Button variant="danger" size="sm" className="h-7 text-xs"
                    onClick={() => bulkRejectMut.mutate(selected)} isLoading={bulkRejectMut.isPending} disabled={isBulking}>
                    <XCircle className="h-3.5 w-3.5" /> Tolak Semua
                  </Button>
                  <Button variant="gradient" size="sm" className="h-7 text-xs"
                    onClick={() => bulkApproveMut.mutate(selected)} isLoading={bulkApproveMut.isPending} disabled={isBulking}>
                    <CheckSquare className="h-3.5 w-3.5" /> Approve Semua
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Draft rows */}
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/4 animate-pulse" />)}
            </div>
          ) : drafts.length === 0 ? (
            <p className="text-center py-6 text-sm text-[#475569]">Belum ada draft di upload ini.</p>
          ) : (
            <div className="space-y-2">
              {drafts.map(d => (
                <DraftRow key={d.id} draft={d}
                  selected={selected.includes(d.id)}
                  onToggle={() => toggleOne(d.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AdminAiDraftsPage() {
  const qc = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['upload-groups'],
    queryFn:  () => adminApi.drafts({ group_by_upload: 1, per_page: 20 }),
    staleTime: 15_000,
    refetchInterval: 20_000,
  });

  const testMut = useMutation({
    mutationFn: () => adminApi.createTestDraft(),
    onSuccess: (res) => { toast.success(res.data?.message ?? 'Draft test dibuat!'); qc.invalidateQueries({ queryKey: ['upload-groups'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal.'),
  });

  const raw     = data?.data?.data;
  const uploads: any[] = raw?.data ?? [];
  const total   = raw?.total ?? uploads.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="✅ Review Soal AI"
        description="Soal dikelompokkan per upload. Pilih soal lalu bulk approve atau bulk reject sekaligus."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => testMut.mutate()} isLoading={testMut.isPending}>
              ✨ Draft Test
            </Button>
            <Button variant="secondary" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-[#64748b]">
        <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-indigo-400" /> Klik nama upload untuk expand soal</span>
        <span className="flex items-center gap-1.5"><CheckSquare className="h-3.5 w-3.5 text-emerald-400" /> Centang soal lalu klik "Approve Semua"</span>
        <span className="flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5 text-amber-400" /> Edit soal sebelum approve</span>
      </div>

      {/* Upload groups */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : uploads.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="text-5xl mb-3">📂</div>
          <p className="font-semibold text-[#f1f5f9]">Belum ada upload dengan draft</p>
          <p className="text-sm text-[#64748b] mt-1">Upload materi di halaman AI Upload, atau buat draft test.</p>
          <Button variant="gradient" size="sm" className="mt-4 mx-auto" onClick={() => testMut.mutate()} isLoading={testMut.isPending}>
            ✨ Buat Draft Test Sekarang
          </Button>
        </Card>
      ) : (
        <>
          <p className="text-xs text-[#475569]">
            {total} upload · auto-refresh tiap 20 detik
          </p>
          <div className="space-y-4">
            {uploads.map(u => <UploadGroup key={u.id} upload={u} />)}
          </div>
        </>
      )}
    </div>
  );
}
