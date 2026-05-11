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
  MessageCircle, CreditCard, Sparkles, X, Crown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// ── Navigation groups ──────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { href: ROUTES.dashboard,   label: 'Dashboard',    icon: LayoutDashboard, exact: true  },
      { href: ROUTES.latihan,     label: 'Latihan Soal', icon: BookOpen,         exact: false },
      { href: ROUTES.weakness,    label: 'Kelemahanku',  icon: BarChart2,        exact: false },
      { href: ROUTES.leaderboard, label: 'Leaderboard',  icon: Trophy,           exact: false },
    ],
  },
  {
    label: '✦ AI Tools',
    items: [
      { href: '/ai/photo-solve',  label: 'Foto Soal AI', icon: Camera,        exact: false },
      { href: '/ai/tanya',        label: 'Tanya AI',     icon: MessageCircle, exact: false },
    ],
    accent: true,
  },
  {
    label: 'Akun',
    items: [
      { href: ROUTES.profile,  label: 'Profil',     icon: UserCircle,  exact: false },
      { href: ROUTES.payment,  label: 'Langganan',  icon: CreditCard,  exact: false },
    ],
  },
];

const TIER_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  premium:    { label: 'Premium',    icon: <Crown className="h-3 w-3" />,    color: '#a855f7' },
  daily_pass: { label: 'Daily Pass', icon: <Sparkles className="h-3 w-3" />, color: 'var(--primary)' },
  free:       { label: 'Free',       icon: null,                              color: '#64748b' },
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch {}
    clearAuth();
    toast.success('Berhasil logout.');
    router.push('/login');
  }

  function NavItem({ href, label, icon: Icon, exact, accent = false }: {
    href: string; label: string; icon: any; exact: boolean; accent?: boolean;
  }) {
    const active = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          active ? 'text-white' : 'hover:text-[var(--text-primary)]',
        )}
        style={active ? {
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          boxShadow: '0 4px 14px rgba(14,165,233,0.25)',
        } : {
          color: 'var(--text-muted)',
        }}
      >
        {/* Active left indicator strip */}
        {!active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-5 rounded-full transition-all duration-200"
            style={{ backgroundColor: 'var(--primary)' }} />
        )}
        <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', active && 'scale-110')} />
        <span className="flex-1">{label}</span>
        {accent && !active && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>AI</span>
        )}
      </Link>
    );
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    const tierInfo = TIER_META[user?.tier ?? 'free'];

    return (
      <aside
        className={cn(
          'flex flex-col',
          mobile ? 'w-72 p-4 h-full overflow-y-auto' : 'hidden lg:flex w-64 p-5 sticky top-0 h-screen overflow-y-auto',
        )}
        style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo area */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <Link href={ROUTES.dashboard}
              className="text-lg font-black"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ✦ AI Lolos PTN
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              {mobile && (
                <button onClick={() => setSidebarOpen(false)} className="t-muted hover:t-primary p-1 rounded-lg transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] t-muted pl-0.5">Platform belajar SNBT berbasis AI</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5">
          {NAV_GROUPS.map(({ label, items, accent }) => (
            <div key={label}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: accent ? 'var(--primary)' : 'var(--text-muted)', opacity: accent ? 1 : 0.7 }}>
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(item => (
                  <NavItem key={item.href} {...item} accent={!!accent} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade banner */}
        {user?.tier === 'free' && (
          <Link
            href={ROUTES.payment}
            className="my-4 block rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(2,132,199,0.08))',
              border: '1px solid rgba(14,165,233,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <Crown className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>Upgrade Premium</p>
                <p className="text-[10px] t-muted">Rp49.000/bulan</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {['Soal ∞', 'AI 30x', 'Foto 10x'].map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}>
                  {f}
                </span>
              ))}
            </div>
          </Link>
        )}

        {/* User card */}
        {user && (
          <div className="rounded-2xl p-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar with online dot */}
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                  {getInitials(user.name)}
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 bg-emerald-400"
                  style={{ borderColor: 'var(--bg-elevated)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold t-primary">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {tierInfo.icon && <span style={{ color: tierInfo.color }}>{tierInfo.icon}</span>}
                  <span className="text-[11px] font-medium capitalize" style={{ color: tierInfo.color }}>
                    {tierInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg px-2.5 py-1.5 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                <p className="text-xs font-black t-primary">{user.streak_days}</p>
                <p className="text-[10px] t-muted flex items-center justify-center gap-0.5">
                  <Flame className="h-2.5 w-2.5 text-orange-400" /> Streak
                </p>
              </div>
              <div className="rounded-lg px-2.5 py-1.5 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                <p className="text-xs font-black t-primary">{user.points > 999 ? `${(user.points/1000).toFixed(1)}k` : user.points}</p>
                <p className="text-[10px] t-muted flex items-center justify-center gap-0.5">
                  <Zap className="h-2.5 w-2.5 text-yellow-400" /> Poin
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        )}
      </aside>
    );
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50 shadow-2xl animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between backdrop-blur-xl px-4 py-3 lg:hidden"
          style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-card) 92%, transparent)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors t-muted"
            style={{ border: '1px solid var(--border)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href={ROUTES.dashboard}
            className="text-base font-black"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ✦ AI Lolos PTN
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Link href={ROUTES.profile}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                {getInitials(user.name)}
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
