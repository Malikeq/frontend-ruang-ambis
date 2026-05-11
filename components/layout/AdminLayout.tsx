'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, BookOpen, Sparkles,
  ClipboardCheck, Package, CreditCard, Image,
  LogOut, Menu, X, Shield, ChevronRight,
  University, AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    section: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard',       icon: LayoutDashboard, exact: true  },
    ],
  },
  {
    section: 'Konten & AI',
    items: [
      { href: '/admin/soal',      label: 'Bank Soal',        icon: BookOpen,       exact: false },
      { href: '/admin/ai-upload', label: 'Upload Materi AI', icon: Sparkles,       exact: false },
      { href: '/admin/ai-drafts', label: 'Review Drafts',    icon: ClipboardCheck, exact: false },
    ],
  },
  {
    section: 'Pengguna & Keuangan',
    items: [
      { href: '/admin/users',        label: 'Pengguna',    icon: Users,      exact: false },
      { href: '/admin/packages',     label: 'Paket',       icon: Package,    exact: false },
      { href: '/admin/transactions', label: 'Transaksi',   icon: CreditCard, exact: false },
    ],
  },
  {
    section: 'Utilitas',
    items: [
      { href: '/admin/kampus', label: 'Logo Kampus', icon: Image, exact: false },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } catch {}
    clearAuth();
    toast.success('Berhasil logout.');
    router.push('/login');
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        'flex flex-col',
        mobile
          ? 'w-72 p-4 h-full overflow-y-auto'
          : 'hidden lg:flex w-64 p-5 sticky top-0 h-screen overflow-y-auto',
      )}
      style={{ backgroundColor: '#09090f', borderRight: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Admin Panel</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>AI Lolos PTN</p>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 space-y-5">
        {NAV_GROUPS.map(({ section, items }) => (
          <div key={section}>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active ? 'text-white' : 'hover:text-white',
                    )}
                    style={active ? {
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(2,132,199,0.15))',
                      border: '1px solid rgba(14,165,233,0.3)',
                      boxShadow: '0 2px 12px rgba(14,165,233,0.15)',
                    } : {
                      color: 'rgba(255,255,255,0.45)',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = ''; }}
                  >
                    {/* Accent strip on hover */}
                    {!active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-5 rounded-full transition-all duration-200 bg-sky-400" />
                    )}
                    <Icon className={cn('h-4 w-4 shrink-0', active && 'text-sky-400')} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="h-3.5 w-3.5 opacity-60 text-sky-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-6 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
        {/* Back to user dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
          }}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          ← Kembali ke Dashboard User
        </Link>

        {/* Admin user card */}
        {user && (
          <div className="rounded-2xl p-3" style={{ border: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}>
                  {getInitials(user.name)}
                </div>
                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#ef4444', border: '1.5px solid #09090f' }}>
                  <Shield className="h-1.5 w-1.5 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{user.name}</p>
                <p className="text-[10px] font-bold tracking-wide" style={{ color: '#ef4444' }}>SUPERADMIN</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="admin-layout dark flex min-h-screen" style={{ backgroundColor: '#060609', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50 shadow-2xl animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between backdrop-blur-xl px-4 py-3 lg:hidden"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(6,6,9,0.95)' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin Panel</span>
          </div>
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              {getInitials(user.name)}
            </div>
          )}
        </header>

        {/* Admin warning banner */}
        <div className="hidden lg:flex items-center gap-2.5 px-6 py-2.5"
          style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', background: 'linear-gradient(90deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))' }}>
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-500">
            Super Admin Mode — Tindakan tidak bisa di-undo. Berhati-hatilah.
          </span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            RESTRICTED
          </span>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
