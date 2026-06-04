import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthCookie, clearAuthCookie } from '@/lib/cookies';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  tier: 'free' | 'premium' | 'daily_pass';
  points: number;
  streak_days: number;
  onboarding_completed: boolean;
  diagnostic_completed: boolean;
  avatar_url?: string;
  kampusTargets?: Array<{
    kampus: { id: number; nama: string; akronim: string; logo_url?: string };
    jurusan: { id: number; nama: string; passing_grade_estimate?: number };
    priority: number;
  }>;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth:     (user: AuthUser, token: string) => void;
  setUser:     (user: AuthUser) => void;
  clearAuth:   () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // Write a cookie the middleware can read
        if (typeof document !== 'undefined') {
          setAuthCookie(token, user.role, user.onboarding_completed);
        }
        set({ user, token, isAuthenticated: true });
      },

      setUser: (user) => {
        // Re-sync cookie when user data changes (e.g. onboarding_completed flips)
        const token = get().token;
        if (typeof document !== 'undefined' && token) {
          setAuthCookie(token, user.role, user.onboarding_completed);
        }
        set({ user });
      },

      clearAuth: () => {
        if (typeof document !== 'undefined') clearAuthCookie();
        set({ user: null, token: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        const { token, setUser } = get();
        if (!token) return;
        try {
          const { default: axiosInstance } = await import('@/lib/api');
          const res = await axiosInstance.get('/auth/me');
          const user = res.data?.data ?? res.data;
          if (user?.id) setUser(user);
        } catch { /* ignore */ }
      },
    }),
    { name: 'ailolos-auth' }
  )
);
