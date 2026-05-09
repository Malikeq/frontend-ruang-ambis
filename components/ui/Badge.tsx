import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'premium' | 'free';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default:  'bg-[rgba(99,102,241,0.15)] text-[#a5b4fc] border-[rgba(99,102,241,0.3)]',
    success:  'bg-[rgba(16,185,129,0.15)] text-[#34d399] border-[rgba(16,185,129,0.3)]',
    warning:  'bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border-[rgba(245,158,11,0.3)]',
    error:    'bg-[rgba(239,68,68,0.15)] text-[#f87171] border-[rgba(239,68,68,0.3)]',
    premium:  'bg-[rgba(139,92,246,0.15)] text-[#c4b5fd] border-[rgba(139,92,246,0.3)]',
    free:     'bg-[rgba(100,116,139,0.15)] text-[#94a3b8] border-[rgba(100,116,139,0.3)]',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      variants[variant], className
    )}>
      {children}
    </span>
  );
}
