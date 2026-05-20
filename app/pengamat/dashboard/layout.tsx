'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Trophy, BarChart2,
  AlertTriangle, BookOpen, LogOut, Menu, X, GraduationCap,
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '/pengamat/dashboard',            label: 'Overview',         icon: LayoutDashboard },
  { href: '/pengamat/dashboard/siswa',      label: 'Siswa',            icon: Users },
  { href: '/pengamat/dashboard/ranking',    label: 'Ranking',          icon: Trophy },
  { href: '/pengamat/dashboard/aktivitas',  label: 'Aktivitas',        icon: BarChart2 },
  { href: '/pengamat/dashboard/kelemahan',  label: 'Kelemahan Kelas',  icon: BookOpen },
  { href: '/pengamat/dashboard/at-risk',    label: 'Siswa Berisiko',   icon: AlertTriangle },
];

export default function PengamatDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);

  const logout = () => { clearAuth(); router.push('/pengamat/login'); };

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col bg-gradient-to-b from-slate-900 to-slate-800',
      mobile ? 'w-full h-full p-4' : 'w-64 min-h-screen p-6 hidden lg:flex',
    )}>
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">Dashboard</p>
          <p className="text-xs text-emerald-400 font-semibold">Pengamat Sekolah</p>
        </div>
      </div>

      {/* User info */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-6">
        <p className="text-xs text-slate-400">Login sebagai</p>
        <p className="text-sm font-semibold text-white truncate mt-0.5">{user?.name}</p>
        <p className="text-xs text-emerald-400 truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={logout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-4">
        <LogOut className="h-4 w-4" /> Keluar
      </button>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-72 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Pengamat</span>
          </div>
          <button onClick={() => setOpen(v => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
