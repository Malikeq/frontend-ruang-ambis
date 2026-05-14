import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata: Metadata = {
  title: 'AI Lolos PTN — Belajar SNBT Cerdas dengan AI',
  description: 'Platform belajar SNBT berbasis AI pertama di Indonesia. Analisis kelemahan personal, pembahasan DCSEF, scan foto soal. Mulai gratis.',
  keywords: ['belajar SNBT', 'persiapan UTBK', 'AI PTN', 'soal SNBT', 'tryout gratis'],
  openGraph: {
    title: 'AI Lolos PTN — Belajar SNBT Cerdas dengan AI',
    description: 'Raih kampus impianmu dengan AI yang memahami kelemahanmu secara personal.',
    type: 'website', locale: 'id_ID',
  },
};

const FEATURES = [
  { icon: '🧠', tag: 'Analitik AI',    title: 'Peta Kelemahan Personal',  desc: 'AI memetakan persis sub-materi mana yang perlu diperbaiki berdasarkan pola jawaban — bukan hanya skor akhir.' },
  { icon: '📸', tag: 'Scan & Solve',   title: 'Foto Soal → Solusi Instan', desc: 'Foto soal dari buku atau kertas, AI langsung menjelaskan step-by-step dalam hitungan detik.' },
  { icon: '🔬', tag: 'DCSEF',          title: 'Pembahasan 5 Langkah',      desc: 'Setiap soal dianalisis: Dekonstruksi–Konsep–Strategi–Eksekusi–Fail-proof. Tidak ada lagi hapalan buta.' },
  { icon: '🎯', tag: 'Adaptif',        title: 'Soal Sesuai Level-ku',      desc: 'Sistem memilih soal sesuai kemampuan saat ini — tidak buang waktu di soal terlalu mudah.' },
  { icon: '🏆', tag: 'Gamifikasi',     title: 'Streak & Leaderboard',      desc: 'Bangun kebiasaan belajar harian, kumpulkan poin, dan bersaing di leaderboard nasional.' },
  { icon: '🗺️', tag: 'Target PTN',    title: 'Strategi per Kampus',       desc: 'Pilih dari 4.000+ kampus. AI menyesuaikan rencana belajar dengan passing grade target-mu.' },
];

const PLANS = [
  { name: 'Gratis',      badge: null,       price: 'Rp 0',      period: 'selamanya',  highlight: false, href: '/register', cta: 'Mulai Gratis',    features: ['20 soal per hari', 'Pembahasan AI dasar', 'Streak & Leaderboard', 'Dashboard Progress'] },
  { name: 'Daily Pass',  badge: 'Fleksibel', price: 'Rp 5.000', period: 'per hari',   highlight: false, href: '/register', cta: 'Coba Hari Ini',   features: ['Soal tidak terbatas 1 hari', 'Tanya AI (5×)', 'Foto Soal (3×)', 'Simulasi Ujian'] },
  { name: 'Premium',     badge: 'Terpopuler', price: 'Rp 49.000', period: 'per bulan', highlight: true,  href: '/register', cta: 'Mulai Premium',  features: ['Soal tidak terbatas', 'Tanya AI (30×/hari)', 'Foto Soal (10×/hari)', 'Analisis Kelemahan Penuh', 'Simulasi SNBT Lengkap', 'Prioritas Support'] },
];

const STATS = [
  { value: '4.000+', label: 'Kampus & PTN', icon: '🏛️' },
  { value: '7 Mapel', label: 'SNBT Lengkap', icon: '📚' },
  { value: 'Gratis', label: 'Untuk Mulai', icon: '✨' },
  { value: 'AI 24/7', label: 'Siap Bantu', icon: '🤖' },
];

const STEPS = [
  { n: '1', icon: '🎓', title: 'Daftar & Pilih Target',   desc: 'Pilih kampus & jurusan impian. AI menyesuaikan strategi dengan passing grade-mu.' },
  { n: '2', icon: '📝', title: 'Kerjakan Soal Adaptif',   desc: 'AI memilih soal yang pas untuk level-mu dan mendeteksi pola kelemahanmu.' },
  { n: '3', icon: '🚀', title: 'Pelajari & Tingkatkan',   desc: 'Pembahasan 5-langkah DCSEF + cara cepat. Kelemahanmu teratasi satu per satu.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-base) 85%, transparent)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>✦</div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>AI Lolos PTN</span>
          </div>
          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-7 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            <a href="#features" className="hover:text-[#0ea5e9] transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-[#0ea5e9] transition-colors">Cara Kerja</a>
            <a href="#pricing" className="hover:text-[#0ea5e9] transition-colors">Harga</a>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link href="/login" className="nav-link rounded-lg px-4 py-2 text-sm font-medium">
              Masuk
            </Link>
            <Link href="/register" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
              Mulai Gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-28">
        {/* Subtle blue glow — very faint */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[120px]" style={{ backgroundColor: '#0ea5e9' }} />
          <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full opacity-[0.04] blur-[100px]" style={{ backgroundColor: '#f59e0b' }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 text-center">
          {/* Live badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#0ea5e9' }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75" style={{ backgroundColor: '#0ea5e9' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
            </span>
            Platform AI SNBT #1 Indonesia · Gratis Selamanya
          </div>

          <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl" style={{ color: 'var(--text-primary)' }}>
            Lolos PTN Bukan{' '}
            <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Soal Keberuntungan
            </span>
            <br />
            <span>Tapi </span>
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Strategi AI
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            AI menganalisis <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>kelemahan spesifikmu</strong>, memberi pembahasan{' '}
            <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>5-langkah DCSEF</strong>, dan membantumu belajar{' '}
            <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>lebih efisien</strong> setiap hari.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register"
              className="inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 20px rgba(14,165,233,0.25)' }}>
              Mulai Belajar Gratis →
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold transition-all duration-200 hover:bg-gray-50"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Lihat Fitur ↓
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex -space-x-2">
              {['🧑‍🎓','👩‍🎓','👨‍🎓','🧑‍💻','👩‍💻'].map((e, i) => (
                <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm"
                  style={{ borderColor: '#fff', backgroundColor: '#f9fafb' }}>{e}</div>
              ))}
            </div>
            <span className="ml-1"><strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>1.000+</strong> pelajar bergabung</span>
            <span className="mx-2" style={{ color: '#d1d5db' }}>·</span>
            <span className="font-semibold" style={{ color: '#f59e0b' }}>★ 4.9/5</span>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className="rounded-2xl p-5 transition-all duration-300 hover:shadow-md"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xl font-black" style={{ color: i % 2 === 0 ? '#0ea5e9' : '#f59e0b' }}>{s.value}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24" style={{ backgroundColor: '#f9fafb' }}>
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>Fitur Unggulan</p>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--text-primary)' }}>Yang Membuat Kami Berbeda</h2>
            <p className="mt-4 max-w-lg mx-auto text-base" style={{ color: 'var(--text-muted)' }}>Bukan sekadar bank soal — kami adalah tutor AI personal yang terus belajar tentang kamu</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="group rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ border: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: i % 2 === 0 ? 'rgba(14,165,233,0.08)' : 'rgba(245,158,11,0.08)' }}>{f.icon}</div>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{
                      border: `1px solid ${i % 2 === 0 ? 'rgba(14,165,233,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      backgroundColor: i % 2 === 0 ? 'rgba(14,165,233,0.06)' : 'rgba(245,158,11,0.06)',
                      color: i % 2 === 0 ? '#0ea5e9' : '#f59e0b',
                    }}>{f.tag}</span>
                </div>
                <h3 className="mb-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section id="cara-kerja" className="py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>Alur</p>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--text-primary)' }}>Cara Kerjanya Sederhana</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-7 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ border: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div className="relative mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                    style={{ backgroundColor: '#f0f9ff' }}>{s.icon}</div>
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white"
                    style={{ backgroundColor: '#0ea5e9', boxShadow: '0 3px 10px rgba(14,165,233,0.3)' }}>{s.n}</div>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="pricing" className="py-24" style={{ backgroundColor: '#f9fafb' }}>
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>Harga</p>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--text-primary)' }}>Pilih Paket Belajarmu</h2>
            <p className="mt-4" style={{ color: 'var(--text-muted)' }}>Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {PLANS.map(p => (
              <div key={p.name} className="relative flex flex-col rounded-2xl p-7 transition-all duration-300 hover:shadow-lg"
                style={{
                  border: p.highlight ? '2px solid #0ea5e9' : '1px solid var(--border)',
                  backgroundColor: '#ffffff',
                }}>
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[11px] font-bold text-white shadow-md"
                    style={{ background: p.highlight ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'linear-gradient(135deg, #6b7280, #4b5563)' }}>{p.badge}</div>
                )}
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{p.name}</p>
                  <div className="mt-2 flex items-end gap-1.5">
                    <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{p.price}</span>
                    <span className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>{p.period}</span>
                  </div>
                </div>
                <ul className="mb-7 flex-1 space-y-2.5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-0.5 shrink-0" style={{ color: '#0ea5e9' }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all duration-200 ${p.highlight ? 'text-white hover:opacity-90 hover:shadow-lg' : 'hover:bg-gray-50'}`}
                  style={p.highlight
                    ? { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 16px rgba(14,165,233,0.25)' }
                    : { border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Tidak perlu kartu kredit · Batalkan kapan saja</p>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#ffffff' }}>
            {/* Subtle yellow accent circle */}
            <div className="pointer-events-none absolute right-0 top-0 h-[250px] w-[250px] rounded-full opacity-[0.12] blur-[60px]" style={{ backgroundColor: '#fbbf24' }} />
            <div className="pointer-events-none absolute left-0 bottom-0 h-[200px] w-[200px] rounded-full opacity-[0.08] blur-[50px]" style={{ backgroundColor: '#ffffff' }} />
            <div className="relative">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>Mulai Sekarang</p>
              <h2 className="text-3xl font-black sm:text-4xl leading-tight text-white">
                Siap Lolos PTN Tahun Ini?
              </h2>
              <p className="mt-4 mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Bergabung dengan ribuan pelajar yang sudah memulai perjalanan mereka. Gratis, tidak ada syarat.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-base font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                style={{ backgroundColor: '#ffffff', color: '#0284c7' }}>
                🚀 Daftar Sekarang — Gratis
              </Link>
              <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Tidak perlu kartu kredit · Mulai dalam 30 detik</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-10" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>✦</div>
            <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>AI Lolos PTN</span>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            {[['Masuk', '/login'], ['Daftar', '/register']].map(([label, href]) => (
              <Link key={href} href={href} className="transition-colors hover:text-[#0ea5e9]">{label}</Link>
            ))}
            {[['Fitur', '#features'], ['Harga', '#pricing']].map(([label, href]) => (
              <a key={href} href={href} className="transition-colors hover:text-[#0ea5e9]">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
