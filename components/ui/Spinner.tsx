'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return <Loader2 className={cn('animate-spin text-[#6366f1]', sizes[size], className)} />;
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[rgba(255,255,255,0.06)]',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#141428] p-5">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-8 w-full" />
    </div>
  );
}
