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
      <nav style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-base) 80%, transparent)' }}
        className="sticky top-0 z-50 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>✦</div>
            <span className="text-lg font-black tracking-tight" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI Lolos PTN</span>
          </div>
          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <a href="#features" className="hover:text-[var(--primary)] transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-[var(--primary)] transition-colors">Cara Kerja</a>
            <a href="#pricing" className="hover:text-[var(--primary)] transition-colors">Harga</a>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="nav-link rounded-lg px-3.5 py-2 text-sm">
              Masuk
            </Link>
            <Link href="/register" className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 14px rgba(14,165,233,0.30)' }}>
              Mulai Gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.08] blur-[100px]" style={{ backgroundColor: 'var(--primary)' }} />
          <div className="absolute right-1/4 top-24 h-[350px] w-[350px] rounded-full opacity-[0.05] blur-[100px]" style={{ backgroundColor: 'var(--primary-light)' }} />
        </div>
        {/* Subtle dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative mx-auto max-w-4xl px-5 text-center">
          {/* Live badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{ borderColor: 'var(--primary-border)', backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            </span>
            Platform AI SNBT #1 Indonesia · Gratis Selamanya
          </div>

          <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl" style={{ color: 'var(--text-primary)' }}>
            Lolos PTN Bukan{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light), #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Soal Keberuntungan
            </span>
            <br />
            <span>Tapi </span>
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
              className="inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: 'var(--shadow-glow)' }}>
              Mulai Belajar Gratis →
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold transition-all duration-200"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
              Lihat Fitur ↓
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex -space-x-2">
              {['🧑‍🎓','👩‍🎓','👨‍🎓','🧑‍💻','👩‍💻'].map((e, i) => (
                <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm"
                  style={{ borderColor: 'var(--bg-base)', backgroundColor: 'var(--bg-elevated)' }}>{e}</div>
              ))}
            </div>
            <span className="ml-1"><strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>1.000+</strong> pelajar bergabung</span>
            <span className="mx-2" style={{ color: 'var(--border)' }}>·</span>
            <span className="font-semibold" style={{ color: '#10b981' }}>★ 4.9/5</span>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="rounded-2xl p-5 transition-all duration-300"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Fitur Unggulan</p>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--text-primary)' }}>Yang Membuat Kami Berbeda</h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>Bukan sekadar bank soal — kami adalah tutor AI personal yang terus belajar tentang kamu</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="card-hover group rounded-2xl p-6 hover:scale-[1.01]"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="text-3xl">{f.icon}</div>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{ border: '1px solid var(--primary-border)', backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}>{f.tag}</span>
                </div>
                <h3 className="mb-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section id="cara-kerja" className="py-28" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Alur</p>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--text-primary)' }}>Cara Kerjanya Sederhana</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="relative mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                    style={{ backgroundColor: 'var(--primary-muted)', border: '1px solid var(--primary-border)' }}>{s.icon}</div>
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 2px 8px rgba(14,165,233,0.40)' }}>{s.n}</div>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="pricing" className="py-28">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Harga</p>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: 'var(--text-primary)' }}>Pilih Paket Belajarmu</h2>
            <p className="mt-4" style={{ color: 'var(--text-muted)' }}>Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {PLANS.map(p => (
              <div key={p.name} className="relative flex flex-col rounded-2xl p-7 transition-all duration-300 hover:scale-[1.01]"
                style={{
                  border: p.highlight ? '1px solid var(--primary-border)' : '1px solid var(--border)',
                  backgroundColor: p.highlight ? 'var(--primary-muted)' : 'var(--bg-card)',
                }}>
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[11px] font-bold text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>✦ {p.badge}</div>
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
                      <span className="mt-0.5 shrink-0" style={{ color: '#10b981' }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all duration-200 ${p.highlight ? 'text-white hover:opacity-90' : ''}`}
                  style={p.highlight
                    ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 16px rgba(14,165,233,0.30)' }
                    : { border: '1px solid var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' }}>
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
            style={{ border: '1px solid var(--primary-border)', backgroundColor: 'var(--primary-muted)', boxShadow: 'var(--shadow-glow)' }}>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[250px] w-[400px] rounded-full opacity-[0.08] blur-[80px]" style={{ backgroundColor: 'var(--primary)' }} />
            </div>
            <div className="relative">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Mulai Sekarang</p>
              <h2 className="text-3xl font-black sm:text-4xl leading-tight" style={{ color: 'var(--text-primary)' }}>
                Siap Lolos PTN Tahun Ini?
              </h2>
              <p className="mt-4 mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                Bergabung dengan ribuan pelajar yang sudah memulai perjalanan mereka. Gratis, tidak ada syarat.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: 'var(--shadow-glow)' }}>
                🚀 Daftar Sekarang — Gratis
              </Link>
              <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>Tidak perlu kartu kredit · Mulai dalam 30 detik</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-10" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>✦</div>
            <span className="font-black" style={{ color: 'var(--text-secondary)' }}>AI Lolos PTN</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            {[['Masuk', '/login'], ['Daftar', '/register']].map(([label, href]) => (
              <Link key={href} href={href} className="transition-colors hover:text-[var(--primary)]">{label}</Link>
            ))}
            {[['Fitur', '#features'], ['Harga', '#pricing']].map(([label, href]) => (
              <a key={href} href={href} className="transition-colors hover:text-[var(--primary)]">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
