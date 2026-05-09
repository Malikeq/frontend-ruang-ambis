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
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV = [
  {
    section: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard',       icon: LayoutDashboard, exact: true },
    ],
  },
  {
    section: 'Konten',
    items: [
      { href: '/admin/soal',      label: 'Bank Soal',       icon: BookOpen,      exact: false },
      { href: '/admin/ai-upload', label: 'Upload Materi AI',icon: Sparkles,      exact: false },
      { href: '/admin/ai-drafts', label: 'Review Drafts',   icon: ClipboardCheck,exact: false },
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
    <aside className={cn(
      'flex flex-col bg-[#09090f] border-r border-[rgba(255,255,255,0.06)]',
      mobile ? 'w-72 p-4 h-full overflow-y-auto' : 'hidden lg:flex w-60 p-4 sticky top-0 h-screen overflow-y-auto',
    )}>
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-[#f1f5f9]">Admin Panel</p>
          <p className="text-[10px] text-[#475569]">AI Lolos PTN</p>
        </div>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-[#475569] hover:text-[#f1f5f9]">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 space-y-5">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-[#334155]">{section}</p>
            <div className="space-y-0.5">
              {items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-[rgba(99,102,241,0.15)] text-[#a5b4fc] border border-[rgba(99,102,241,0.25)]'
                        : 'text-[#64748b] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#94a3b8]',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Back to user dashboard */}
      <div className="mt-4 border-t border-[rgba(255,255,255,0.06)] pt-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-[#475569] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#94a3b8] transition-all"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          ← Dashboard User
        </Link>

        {/* Admin info */}
        {user && (
          <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-2.5 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-xs font-bold text-white">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#f1f5f9]">{user.name}</p>
                <p className="text-[10px] text-[#ef4444] font-medium">Superadmin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#64748b] hover:bg-[rgba(239,68,68,0.08)] hover:text-red-400 transition-colors"
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
    <div className="flex min-h-screen bg-[#060609] text-[#f1f5f9]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50 shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,6,9,0.95)] backdrop-blur-xl px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-[#64748b] hover:text-[#f1f5f9]">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#6366f1]" />
            <span className="text-sm font-bold text-[#f1f5f9]">Admin Panel</span>
          </div>
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
          )}
        </header>

        {/* Admin banner */}
        <div className="border-b border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.04)] px-6 py-2 hidden lg:flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-[#ef4444]" />
          <span className="text-xs font-medium text-[#ef4444]">Super Admin Mode — Hati-hati dengan perubahan yang tidak bisa di-undo</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
