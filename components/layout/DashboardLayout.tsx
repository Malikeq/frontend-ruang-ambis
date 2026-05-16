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
  MessageCircle, CreditCard, Sparkles, X, Crown, Star,
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

const TIER_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  premium:    { label: 'Premium',    icon: <Crown className="h-3 w-3" />,    color: '#a855f7', bg: 'rgba(168,85,247,0.10)' },
  daily_pass: { label: 'Daily Pass', icon: <Sparkles className="h-3 w-3" />, color: 'var(--primary)', bg: 'var(--primary-muted)' },
  free:       { label: 'Free',       icon: <Star className="h-3 w-3" />,     color: '#64748b', bg: 'rgba(100,116,139,0.10)' },
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
          'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-all duration-200',
        )}
        style={active ? {
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(14,165,233,0.22)',
        } : {
          color: 'var(--text-muted)',
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--primary-muted)';
            e.currentTarget.style.color = 'var(--primary)';
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', active && 'scale-110')} />
        <span className="flex-1">{label}</span>
        {accent && !active && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>AI</span>
        )}
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
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
        style={{
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(14,165,233,0.12)',
          boxShadow: '2px 0 20px rgba(14,165,233,0.06)',
        }}
      >
        {/* Logo area */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <Link href={ROUTES.dashboard} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-black text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 12px rgba(14,165,233,0.30)' }}>
                ✦
              </div>
              <span className="text-base font-black tracking-tight"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                AI Lolos PTN
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              {mobile && (
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg transition-colors hover:bg-blue-50">
                  <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] pl-10" style={{ color: 'var(--text-muted)' }}>Platform belajar SNBT berbasis AI</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6">
          {NAV_GROUPS.map(({ label, items, accent }) => (
            <div key={label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: accent ? 'var(--primary)' : 'var(--text-muted)', opacity: accent ? 1 : 0.6 }}>
                {label}
              </p>
              <div className="space-y-1">
                {items.map(item => (
                  <NavItem key={item.href} {...item} accent={!!accent} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade banner — amber accent */}
        {user?.tier === 'free' && (
          <Link
            href={ROUTES.payment}
            className="my-4 block rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.07))',
              border: '1px solid rgba(245,158,11,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))' }}>
                <Crown className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--secondary-dark)' }}>Upgrade Premium</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Rp49.000/bulan</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {['Soal ∞', 'AI 30x', 'Foto 10x'].map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: 'var(--secondary-dark)' }}>
                  {f}
                </span>
              ))}
            </div>
          </Link>
        )}

        {/* User card */}
        {user && (
          <div className="rounded-2xl p-3.5"
            style={{ border: '1px solid rgba(14,165,233,0.14)', backgroundColor: 'rgba(14,165,233,0.04)' }}>
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                  {getInitials(user.name)}
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 bg-emerald-400"
                  style={{ borderColor: 'rgba(14,165,233,0.04)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ color: tierInfo.color, backgroundColor: tierInfo.bg }}>
                    {tierInfo.icon}
                    {tierInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini stats — amber for streak, blue for points */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl px-2.5 py-2 text-center"
                style={{ backgroundColor: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                <p className="text-sm font-black" style={{ color: '#ea580c' }}>{user.streak_days}</p>
                <p className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5" style={{ color: '#ea580c', opacity: 0.8 }}>
                  <Flame className="h-2.5 w-2.5" /> Streak
                </p>
              </div>
              <div className="rounded-xl px-2.5 py-2 text-center"
                style={{ backgroundColor: 'var(--secondary-muted)', border: '1px solid var(--secondary-border)' }}>
                <p className="text-sm font-black" style={{ color: 'var(--secondary-dark)' }}>
                  {user.points > 999 ? `${(user.points / 1000).toFixed(1)}k` : user.points}
                </p>
                <p className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5" style={{ color: 'var(--secondary-dark)', opacity: 0.8 }}>
                  <Zap className="h-2.5 w-2.5" /> Poin
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(14,165,233,0.15)', backgroundColor: '#fff' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)';
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
    <div className="flex min-h-screen" style={{ backgroundColor: '#f0f9ff', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50 shadow-2xl animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between backdrop-blur-xl px-4 py-3 lg:hidden"
          style={{
            borderBottom: '1px solid rgba(14,165,233,0.12)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 1px 12px rgba(14,165,233,0.07)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
            style={{ border: '1px solid rgba(14,165,233,0.18)', backgroundColor: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-muted)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <Menu className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          </button>

          <Link href={ROUTES.dashboard}
            className="flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            <span className="text-base font-black">✦ AI Lolos PTN</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Link href={ROUTES.profile}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0 shadow-md"
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

        {/* Footer */}
        <footer className="py-4 px-6 lg:px-8 text-center"
          style={{ borderTop: '1px solid rgba(14,165,233,0.10)' }}>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} AI Lolos PTN · Platform belajar SNBT berbasis AI
          </p>
        </footer>
      </div>
    </div>
  );
}
