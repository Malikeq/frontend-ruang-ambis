'use client';

import { GraduationCap, Clock, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function PengamatPendingPage() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl p-10 shadow-2xl">
          <div className="h-16 w-16 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-2">Menunggu Verifikasi</h1>
          <p className="text-sm text-slate-500 mb-6">
            Pendaftaran akun pengamatan kamu sudah masuk. Admin akan segera memverifikasi
            dan menghubungkanmu ke sekolah yang dipilih.
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 mb-6">
            Proses verifikasi biasanya 1×24 jam. Coba login kembali setelah mendapat konfirmasi.
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/pengamat/login'); }}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
