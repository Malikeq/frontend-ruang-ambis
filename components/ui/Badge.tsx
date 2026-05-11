import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'premium' | 'free';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  // All colors work in both light and dark since they use semi-transparent overlays
  const variants: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(14,165,233,0.12)',  color: 'var(--primary)',        border: '1px solid rgba(14,165,233,0.25)' },
    success: { background: 'rgba(16,185,129,0.12)',  color: '#10b981',              border: '1px solid rgba(16,185,129,0.25)' },
    warning: { background: 'rgba(245,158,11,0.12)',  color: '#f59e0b',              border: '1px solid rgba(245,158,11,0.25)' },
    error:   { background: 'rgba(239,68,68,0.12)',   color: '#ef4444',              border: '1px solid rgba(239,68,68,0.25)'  },
    premium: { background: 'rgba(139,92,246,0.12)',  color: '#8b5cf6',              border: '1px solid rgba(139,92,246,0.25)' },
    free:    { background: 'rgba(100,116,139,0.12)', color: 'var(--text-muted)',    border: '1px solid var(--border)'         },
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}
      style={variants[variant]}
    >
      {children}
    </span>
  );
}
