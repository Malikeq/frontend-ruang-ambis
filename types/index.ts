// ── Common ───────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tier: 'free' | 'premium' | 'daily_pass';
  points: number;
  streak_days: number;
  last_active?: string;
  is_banned: boolean;
  onboarding_completed: boolean;
  diagnostic_completed: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Kampus {
  id: number;
  api_id?: number;
  nama: string;
  akronim: string;
  kota?: string;
  provinsi?: string;
  tipe?: string;
  group?: string;
  alamat?: string;
  logo_url?: string;
  jurusan_count?: number;
}

export interface Jurusan {
  id: number;
  kampus_id: number;
  nama: string;
  fakultas?: string;
  passing_grade_estimate?: number;
  peminat_tahun_lalu?: number;
}

export interface Mapel {
  id: number;
  nama: string;
  kode: string;
  snbt_weight: number;
}

export interface SubMateri {
  id: number;
  mapel_id: number;
  nama: string;
}

export interface PilihanJawaban {
  id: number;
  label: string;
  konten: string;
  is_correct?: boolean;
}

export interface Soal {
  id: number;
  konten: string;
  tipe: 'MC' | 'BS' | 'MJ';
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit';
  is_ai_generated: boolean;
  mapel: Mapel;
  sub_materi: SubMateri;
  pilihan_jawaban: PilihanJawaban[];
}

export interface SesiLatihan {
  id: number;
  tipe: 'harian' | 'ujian' | 'diagnostic';
  soal_ids: number[];
  mulai: string;
  selesai?: string;
  skor_raw?: number;
}

export interface UserAttempt {
  id: number;
  soal_id: number;
  is_correct: boolean;
  waktu_ms: number;
}

export interface WeaknessReport {
  id: number;
  sub_materi: SubMateri;
  mapel: Mapel;
  attempt_count: number;
  correct_count: number;
  accuracy_rate: number;
  is_flagged: boolean;
  last_seen?: string;
}

export interface DCSEFAnalysis {
  classifier?: { mapel: string; sub_materi: string; estimasi_kesulitan: string; jebakan_terdeteksi: string[] };
  dekonstruksi?: { diketahui: string[]; ditanya: string; jebakan: string[]; kata_kunci: string[] };
  strategi?: { konsep_utama: string; rumus: string; kapan_pakai: string; bedakan_dengan: string; tips_cepat: string };
  eksekusi?: { langkah: { no: number; aksi: string; hasil: string | null }[] };
  output?: { jawaban_akhir: string; opsi_benar: string; cara_cepat: string; waktu_ideal_detik: number };
  weakness_tags?: string[];
  from_cache?: boolean;
}

export interface Package {
  id: number;
  nama: string;
  harga_idr: number;
  durasi_hari: number;
  fitur_json: string[];
  is_active: boolean;
}

export interface Transaction {
  id: number;
  package: Package;
  gross_amount: number;
  midtrans_order_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/** Paginated data envelope (matches Laravel's paginator shape) */
export interface PaginatedData<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

/** ApiResponse whose data field is a paginated collection */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
