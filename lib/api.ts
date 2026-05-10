import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE } from './constants';

// ── Axios instance ────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default axiosInstance;

// ── Auth ─────────────────────────────────────────────────
export const authApi = {
  register:       (d: any)    => axiosInstance.post('/auth/register', d),
  login:          (d: any)    => axiosInstance.post('/auth/login', d),
  logout:         ()          => axiosInstance.post('/auth/logout'),
  me:             ()          => axiosInstance.get('/auth/me'),
  forgotPassword: (email: string) => axiosInstance.post('/auth/forgot', { email }),
  resetPassword:  (d: any)    => axiosInstance.post('/auth/reset', d),
  resendVerify:   ()          => axiosInstance.post('/auth/verify/resend'),
};

// ── Onboarding ───────────────────────────────────────────
export const onboardingApi = {
  getKampus:  (search?: string, provinsi?: string) =>
    axiosInstance.get('/kampus', { params: { search, provinsi, size: 200 } }),
  getJurusan: (kampusId: number) =>
    axiosInstance.get(`/kampus/${kampusId}/jurusan`),
  setTarget:  (targets: any[])  => axiosInstance.post('/onboarding/target', { targets }),
  saveReferral: (source: string)  => axiosInstance.post('/onboarding/referral', { referral_source: source }),
  startDiag:  ()                => axiosInstance.post('/onboarding/diagnostic/mulai'),
  submitDiag: (data: any)       => axiosInstance.post('/onboarding/diagnostic/jawab', data),
  complete:   ()                => axiosInstance.post('/onboarding/complete'),
};

// ── Dashboard ────────────────────────────────────────────
export const dashboardApi = {
  get:      () => axiosInstance.get('/dashboard'),
  streak:   () => axiosInstance.get('/dashboard/streak'),
  progress: () => axiosInstance.get('/dashboard/progress'),
};

// ── User data ─────────────────────────────────────────────
export const userApi = {
  /** GET /user/targets — kampus targets with full kampus+jurusan+logo_url */
  getTargets: () => axiosInstance.get('/user/targets'),
};


// ── Weakness ─────────────────────────────────────────────
export const weaknessApi = {
  getAll:  ()              => axiosInstance.get('/weakness'),
  detail:  (id: number)    => axiosInstance.get(`/weakness/${id}`),
};

// ── Leaderboard ──────────────────────────────────────────
export const leaderboardApi = {
  getAll: ()  => axiosInstance.get('/leaderboard'),
  myRank: ()  => axiosInstance.get('/leaderboard/me'),
};

// ── Latihan ──────────────────────────────────────────────
export const latihanApi = {
  mulai:   (tipe: string, mapel_ids?: number[]) => axiosInstance.post('/latihan/mulai', { tipe, mapel_ids }),
  getSoal: (sesiId: number, index: number)      => axiosInstance.get(`/latihan/${sesiId}/soal/${index}`),
  jawab:   (sesiId: number, data: any)          => axiosInstance.post(`/latihan/${sesiId}/jawab`, data),
  selesai: (sesiId: number)                     => axiosInstance.post(`/latihan/${sesiId}/selesai`),
  hasil:   (sesiId: number)                     => axiosInstance.get(`/latihan/${sesiId}/hasil`),
};

// ── AI ───────────────────────────────────────────────────
export const aiApi = {
  getExplanation: (soalId: number) => axiosInstance.get(`/ai/explanation/${soalId}`),
  tanya:          (data: any)      => axiosInstance.post('/ai/tanya', data),
  photoSolve:     (formData: FormData) =>
    axiosInstance.post('/ai/photo-solve', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Payment ──────────────────────────────────────────────
export const paymentApi = {
  getPackages:  ()             => axiosInstance.get('/packages'),
  initiate:     (data: any)   => axiosInstance.post('/payment/initiate', data),
  status:       (orderId: string) => axiosInstance.get(`/payment/status/${orderId}`),
  applyPromo:   (kode: string) => axiosInstance.post('/payment/promo', { kode }),
};

// ── Admin ────────────────────────────────────────────────
export const adminApi = {
  dashboard:       ()          => axiosInstance.get('/admin/dashboard'),
  revenue:         ()          => axiosInstance.get('/admin/dashboard/revenue'),
  aiCosts:         ()          => axiosInstance.get('/admin/dashboard/ai-costs'),
  transactions:    (p?: any)   => axiosInstance.get('/admin/transactions', { params: p }),
  users:           (p?: any)   => axiosInstance.get('/admin/users', { params: p }),
  banUser:         (id: number)=> axiosInstance.post(`/admin/users/${id}/ban`),
  unbanUser:       (id: number)=> axiosInstance.post(`/admin/users/${id}/unban`),
  updateUserTier:  (id: number, tier: string) => axiosInstance.patch(`/admin/users/${id}/tier`, { tier }),
  soal:            (p?: any)   => axiosInstance.get('/admin/soal', { params: p }),
  publishSoal:     (id: number)=> axiosInstance.post(`/admin/soal/${id}/publish`),
  deleteSoal:      (id: number)=> axiosInstance.delete(`/admin/soal/${id}`),
  aiUpload:        (fd: FormData) =>
    axiosInstance.post('/admin/ai/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadHistory:   ()          => axiosInstance.get('/admin/ai/upload/history'),
  uploadStatus:    (id: number) => axiosInstance.get(`/admin/ai/upload/${id}/status`),
  retryUpload:     (id: number) => axiosInstance.post(`/admin/ai/upload/${id}/retry`),
  drafts:              (p?: any)   => axiosInstance.get('/admin/ai/drafts', { params: p }),
  createTestDraft:     ()          => axiosInstance.post('/admin/ai/drafts/test'),
  bulkApproveDrafts:   (ids: number[]) => axiosInstance.post('/admin/ai/drafts/bulk-approve', { draft_ids: ids }),
  bulkRejectDrafts:    (ids: number[]) => axiosInstance.post('/admin/ai/drafts/bulk-reject',  { draft_ids: ids }),
  approveDraft:        (id: number)=> axiosInstance.post(`/admin/ai/drafts/${id}/approve`),
  rejectDraft:         (id: number)=> axiosInstance.post(`/admin/ai/drafts/${id}/reject`),
  editDraft:           (id: number, data: any) => axiosInstance.patch(`/admin/ai/drafts/${id}`, data),
  mapelList:       ()          => axiosInstance.get('/admin/mapel-list'),
  packages:        ()          => axiosInstance.get('/admin/packages'),
  createPackage:   (d: any)    => axiosInstance.post('/admin/packages', d),
  updatePackage:   (id: number, d: any) => axiosInstance.patch(`/admin/packages/${id}`, d),
  deletePackage:   (id: number)=> axiosInstance.delete(`/admin/packages/${id}`),
  // Kampus logos
  kampus:          (p?: any)   => axiosInstance.get('/admin/kampus', { params: p }),
  fetchKampusLogo: (id: number)=> axiosInstance.post(`/admin/kampus/${id}/fetch-logo`),
  fetchAllLogos:   (p?: any)   => axiosInstance.post('/admin/kampus/fetch-all-logos', p),
};

