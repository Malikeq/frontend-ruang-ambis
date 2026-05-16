// ── App ─────────────────────────────────────────────────────
export const APP_NAME = 'AI Lolos PTN';
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// ── Routes ──────────────────────────────────────────────────
export const ROUTES = {
  home:        '/',
  login:       '/login',
  register:    '/register',
  forgot:      '/forgot-password',
  onboarding:  '/onboarding',
  dashboard:   '/dashboard',
  latihan:     '/latihan',
  weakness:    '/weakness',
  leaderboard: '/leaderboard',
  payment:     '/payment',
  profile:     '/profile',
  admin: {
    dashboard:    '/admin/dashboard',
    users:        '/admin/users',
    soal:         '/admin/soal',
    aiUpload:     '/admin/ai-upload',
    aiDrafts:     '/admin/ai-drafts',
    packages:     '/admin/packages',
    transactions: '/admin/transactions',
    aiSettings:   '/admin/ai-settings',
  },
} as const;

// ── SNBT Mapel ───────────────────────────────────────────────
export const MAPEL_LIST = [
  { kode: 'PU',   nama: 'Penalaran Umum',                        colorClass: 'bg-sky-100 text-sky-700' },
  { kode: 'PM',   nama: 'Penalaran Matematika',                  colorClass: 'bg-sky-100 text-sky-700' },
  { kode: 'LBI',  nama: 'Literasi Bahasa Indonesia',             colorClass: 'bg-sky-100 text-sky-700' },
  { kode: 'LBE',  nama: 'Literasi Bahasa Inggris',               colorClass: 'bg-sky-100 text-sky-700' },
  { kode: 'KMBM', nama: 'Kemampuan Memahami Bacaan & Menulis',   colorClass: 'bg-sky-100 text-sky-700' },
  { kode: 'PK',   nama: 'Pengetahuan Kuantitatif',               colorClass: 'bg-sky-100 text-sky-700' },
  { kode: 'PPU',  nama: 'Pengetahuan & Pemahaman Umum',          colorClass: 'bg-sky-100 text-sky-700' },
] as const;

// ── Tier labels ──────────────────────────────────────────────
export const TIER_LABELS: Record<string, string> = {
  free:       'Gratis',
  premium:    'Premium',
  daily_pass: 'Daily Pass',
};

// ── Difficulty levels ────────────────────────────────────────
export const DIFFICULTY_COLORS: Record<string, string> = {
  mudah:  'border-green-500/30 text-green-400',
  sedang: 'border-yellow-500/30 text-yellow-400',
  sulit:  'border-red-500/30 text-red-400',
};
