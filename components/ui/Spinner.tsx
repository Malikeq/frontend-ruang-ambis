'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <Loader2
      className={cn('animate-spin', sizes[size], className)}
      style={{ color: 'var(--primary)' }}
    />
  );
}

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg', className)}
      style={{ backgroundColor: 'var(--bg-elevated)' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="space-y-3 rounded-2xl p-5"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-8 w-full" />
    </div>
  );
}

/** Full-page loading state */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat...</p>
      </div>
    </div>
  );
}
