import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Lolos PTN — Belajar SNBT Cerdas dengan AI Gratis',
  description:
    'Platform belajar SNBT berbasis AI pertama di Indonesia yang menganalisis kelemahan secara personal, memberikan pembahasan langkah-demi-langkah DCSEF, dan scan foto soal. Mulai gratis hari ini.',
  keywords: ['belajar SNBT', 'persiapan UTBK', 'AI belajar PTN', 'soal SNBT online', 'pembahasan SNBT AI', 'tryout SNBT gratis', 'lolos PTN 2025'],
  openGraph: {
    title: 'AI Lolos PTN — Belajar SNBT Cerdas dengan AI',
    description: 'Raih kampus impianmu dengan AI yang memahami kelemahanmu secara personal.',
    type: 'website', locale: 'id_ID',
  },
};

const FEATURES = [
  {
    icon: '🧠',
    title: 'Analisis Kelemahan Personal',
    desc: 'AI memetakan sub-materi yang kamu lemah berdasarkan pola jawaban, bukan hanya skor akhir. Kamu tahu PERSIS apa yang harus diperbaiki.',
  },
  {
    icon: '📸',
    title: 'Foto Soal → Solusi Instan',
    desc: 'Foto soal dari buku atau kertas ujian, AI langsung menganalisis dan menjelaskan step-by-step. Tidak perlu ketik ulang soal.',
  },
  {
    icon: '🔬',
    title: 'Pembahasan 5 Langkah DCSEF',
    desc: 'Setiap soal dianalisis dengan kerangka Dekonstruksi–Strategi–Eksekusi–Output lengkap dengan cara cepat dan jebakan yang harus dihindari.',
  },
  {
    icon: '🎯',
    title: 'Soal Adaptif Berdasarkan Level',
    desc: 'Sistem memilih soal sesuai level kemampuanmu saat ini. Tidak buang waktu soal terlalu mudah, tidak frustrasi soal terlalu sulit.',
  },
  {
    icon: '🏆',
    title: 'Streak & Leaderboard Nasional',
    desc: 'Bangun kebiasaan belajar harian dengan streak, kumpulkan poin, dan bersaing di leaderboard nasional sesama pejuang SNBT.',
  },
  {
    icon: '🗺️',
    title: 'Target Kampus Terintegrasi',
    desc: 'Pilih kampus & jurusan impian dari 4.000+ universitas seluruh Indonesia. AI menyesuaikan strategi belajarmu dengan passing grade target.',
  },
];

const PLANS = [
  {
    name: 'Gratis', price: 'Rp 0', period: 'selamanya',
    features: ['20 soal per hari', 'Pembahasan AI (cached)', 'Leaderboard & Streak', 'Dashboard Progress'],
    cta: 'Mulai Gratis', href: '/register', highlight: false,
  },
  {
    name: 'Daily Pass', price: 'Rp 5.000', period: 'per hari',
    features: ['Soal tidak terbatas 1 hari', 'Tanya AI (5x)', 'Foto ke Soal (3x)', 'Mode Simulasi Ujian'],
    cta: 'Coba Hari Ini', href: '/register', highlight: false,
  },
  {
    name: 'Premium', price: 'Rp 49.000', period: 'per bulan',
    features: ['Soal tidak terbatas', 'Tanya AI (30x/hari)', 'Foto ke Soal (10x/hari)', 'Analisis Kelemahan Lengkap', 'Mode Simulasi SNBT', 'Prioritas Support'],
    cta: 'Mulai Premium', href: '/register', highlight: true,
  },
];

const STATS = [
  { value: '4.000+', label: 'Kampus tersedia' },
  { value: '7 Mapel', label: 'SNBT lengkap' },
  { value: 'Gratis', label: 'untuk mulai' },
  { value: 'AI 24/7', label: 'siap membantu' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080810] text-[#f1f5f9]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,8,16,0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            ✦ AI Lolos PTN
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 text-center">
        {/* Glow bg */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[600px] rounded-full bg-[#6366f1] opacity-[0.07] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] px-4 py-1.5 text-xs font-semibold text-[#a5b4fc]">
            🚀 Platform AI SNBT pertama di Indonesia
          </div>

          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Lolos PTN Bukan Soal{' '}
            <span className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">
              Keberuntungan
            </span>
            <br />Tapi{' '}
            <span className="bg-gradient-to-r from-[#f59e0b] to-[#ef4444] bg-clip-text text-transparent">
              Strategi
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-[#64748b] leading-relaxed">
            AI Lolos PTN menganalisis <strong className="text-[#94a3b8]">kelemahan spesifikmu</strong>, memberikan pembahasan{' '}
            <strong className="text-[#94a3b8]">5 langkah DCSEF</strong>, dan membantu kamu belajar{' '}
            <strong className="text-[#94a3b8]">lebih efisien setiap hari</strong> — bukan sekadar latihan soal biasa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] transition-all duration-300"
            >
              Mulai Belajar Gratis →
            </Link>
            <Link
              href="#features"
              className="rounded-2xl border border-[rgba(255,255,255,0.1)] px-8 py-4 text-base font-semibold text-[#94a3b8] hover:border-[rgba(99,102,241,0.4)] hover:text-[#f1f5f9] transition-all duration-200"
            >
              Lihat Fitur ↓
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
                <p className="text-2xl font-black text-[#f1f5f9]">{s.value}</p>
                <p className="mt-1 text-xs text-[#475569]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black sm:text-4xl">Yang Membuat Kami Berbeda</h2>
            <p className="mt-3 text-[#64748b]">Bukan sekadar kumpulan soal — kami adalah tutor AI personalmu</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.04)] transition-all duration-300"
              >
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-[#f1f5f9]">{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[rgba(255,255,255,0.01)]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-14 text-3xl font-black sm:text-4xl">Cara Kerjanya Sederhana</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Daftar & Pilih Target', desc: 'Pilih kampus & jurusan impian dari 4.000+ universitas se-Indonesia' },
              { step: '02', title: 'Kerjakan Soal', desc: 'AI memilih soal yang sesuai level dan mengidentifikasi kelemahanmu' },
              { step: '03', title: 'Pelajari Pembahasan', desc: 'AI menjelaskan 5 langkah penyelesaian lengkap dengan cara cepat' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-xl font-black text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-bold text-[#f1f5f9]">{item.title}</h3>
                <p className="text-sm text-[#64748b]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black sm:text-4xl">Pilih Paket Belajarmu</h2>
            <p className="mt-3 text-[#64748b]">Mulai gratis, upgrade kapan saja sesuai kebutuhan</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-7 ${
                  p.highlight
                    ? 'border-[rgba(99,102,241,0.5)] bg-gradient-to-b from-[rgba(99,102,241,0.12)] to-[rgba(139,92,246,0.06)]'
                    : 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-1 text-xs font-bold text-white">
                    TERPOPULER
                  </div>
                )}
                <p className="text-sm font-semibold text-[#a5b4fc]">{p.name}</p>
                <p className="mt-1 text-3xl font-black text-[#f1f5f9]">{p.price}</p>
                <p className="text-xs text-[#475569]">{p.period}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                      <span className="mt-0.5 text-[#10b981]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`mt-7 block w-full rounded-xl py-3 text-center text-sm font-bold transition-all duration-200 ${
                    p.highlight
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white hover:opacity-90'
                      : 'border border-[rgba(255,255,255,0.1)] text-[#94a3b8] hover:border-[rgba(99,102,241,0.4)] hover:text-[#f1f5f9]'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-black sm:text-4xl">Siap Lolos PTN Tahun Ini?</h2>
          <p className="mt-4 text-[#64748b]">Bergabung dengan ribuan pejuang SNBT yang sudah memulai perjalanan mereka</p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-10 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] transition-all duration-300"
          >
            Daftar Sekarang — Gratis 🚀
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-10 text-center text-sm text-[#475569]">
        <p className="font-black text-base bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-2">
          ✦ AI Lolos PTN
        </p>
        <p>© {new Date().getFullYear()} AI Lolos PTN. Dibuat untuk pejuang SNBT Indonesia.</p>
        <div className="mt-3 flex justify-center gap-6 text-xs">
          <Link href="/login" className="hover:text-[#f1f5f9] transition-colors">Masuk</Link>
          <Link href="/register" className="hover:text-[#f1f5f9] transition-colors">Daftar</Link>
        </div>
      </footer>
    </div>
  );
}
