'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { getInitials, getTierColor } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';
import {
  LayoutDashboard, BookOpen, BarChart2, Trophy,
  Camera, LogOut, Menu, Zap, Flame, UserCircle,
  MessageCircle, CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: ROUTES.dashboard,   label: 'Dashboard',    icon: LayoutDashboard, exact: true  },
  { href: ROUTES.latihan,     label: 'Latihan Soal', icon: BookOpen,         exact: false },
  { href: ROUTES.weakness,    label: 'Kelemahanku',  icon: BarChart2,        exact: false },
  { href: ROUTES.leaderboard, label: 'Leaderboard',  icon: Trophy,           exact: false },
  { href: '/ai/photo-solve',  label: 'Foto Soal',    icon: Camera,           exact: false },
  { href: '/ai/tanya',        label: 'Tanya AI',     icon: MessageCircle,    exact: false },
  { href: ROUTES.profile,     label: 'Profil',       icon: UserCircle,       exact: false },
];


export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch {}
    clearAuth();
    toast.success('Berhasil logout.');
    router.push('/login');
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      'flex flex-col bg-[#0d0d1f] border-r border-[rgba(255,255,255,0.06)]',
      mobile ? 'w-72 p-4' : 'hidden lg:flex w-64 p-5 sticky top-0 h-screen',
    )}>
      {/* Logo */}
      <Link href={ROUTES.dashboard} className="mb-8 text-lg font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
        ✦ AI Lolos PTN
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[rgba(99,102,241,0.15)] text-[#a5b4fc] border border-[rgba(99,102,241,0.25)]'
                  : 'text-[#64748b] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#94a3b8]',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade banner — only for free tier */}
      {user?.tier === 'free' && (
        <Link
          href={ROUTES.payment}
          className="mb-3 flex items-center gap-2.5 rounded-xl border border-[rgba(139,92,246,0.3)] bg-gradient-to-r from-[rgba(99,102,241,0.12)] to-[rgba(139,92,246,0.06)] p-3 hover:border-[rgba(139,92,246,0.5)] transition-all group"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
            <CreditCard className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#a5b4fc]">Upgrade Premium</p>
            <p className="text-[10px] text-[#64748b]">Soal unlimited · AI 30x/hari</p>
          </div>
        </Link>
      )}

      {/* User card */}
      {user && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#f1f5f9]">{user.name}</p>
              <p className={cn('text-xs font-medium capitalize', getTierColor(user.tier))}>
                {user.tier === 'daily_pass' ? 'Daily Pass' : user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 text-xs text-[#64748b] mb-3">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" />{user.streak_days} hari
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" />{user.points.toLocaleString('id')} poin
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[#64748b] hover:bg-[rgba(239,68,68,0.08)] hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      )}
    </aside>
  );


  return (
    <div className="flex min-h-screen bg-[#080810] text-[#f1f5f9]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,8,16,0.9)] backdrop-blur-xl px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-[#64748b] hover:text-[#f1f5f9]">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">✦ AI Lolos PTN</span>
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
