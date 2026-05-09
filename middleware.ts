import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'ailolos_auth';

function parseAuth(request: NextRequest) {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return { isAuthenticated: false, isAdmin: false, onboardingDone: false };
  try {
    const data = JSON.parse(decodeURIComponent(raw));
    return {
      isAuthenticated: !!data?.token,
      isAdmin:         data?.role === 'superadmin',
      onboardingDone:  !!data?.onboarding_completed,
    };
  } catch {
    return { isAuthenticated: false, isAdmin: false, onboardingDone: false };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated, isAdmin, onboardingDone } = parseAuth(request);

  // ── Auth pages: redirect logged-in users ──────────────
  // /reset-password is excluded so email links still work when logged in
  const AUTH_PAGES = ['/login', '/register', '/forgot-password'];
  if (AUTH_PAGES.includes(pathname)) {
    if (isAuthenticated) {
      const dest = !onboardingDone ? '/onboarding' : '/dashboard';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // ── Onboarding: only authenticated ────────────────────
  if (pathname.startsWith('/onboarding')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // ── Protected app routes ──────────────────────────────
  const PROTECTED_PREFIXES = [
    '/dashboard', '/latihan', '/weakness', '/leaderboard',
    '/ai', '/profile', '/payment',
  ];
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url),
      );
    }
    // Force incomplete-onboarding users back to onboarding
    if (!onboardingDone) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return NextResponse.next();
  }

  // ── Admin routes ──────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', request.url));
    if (!isAdmin)         return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
