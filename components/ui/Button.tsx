'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gradient' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gradient', size = 'md', isLoading, disabled, children, style, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed select-none';

    const sizes = {
      sm:  'h-8  px-3 text-xs',
      md:  'h-10 px-4 text-sm',
      lg:  'h-12 px-6 text-sm',
    };

    // Variant styles use CSS variables — adapt to light/dark automatically
    const variantStyles: Record<string, React.CSSProperties> = {
      gradient: {
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        boxShadow: '0 4px 14px rgba(14,165,233,0.25)',
      },
      secondary: {
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-secondary)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
      },
      danger: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#ef4444',
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, sizes[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
