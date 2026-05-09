/**
 * Cookie helpers — used by authStore to keep cookies in sync
 * so Next.js middleware can read auth state.
 */

const COOKIE_NAME = 'ailolos_auth';
const MAX_AGE     = 60 * 60 * 24 * 30; // 30 days

export function setAuthCookie(token: string, role: string, onboarding_completed: boolean) {
  const value = JSON.stringify({ token, role, onboarding_completed });
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
