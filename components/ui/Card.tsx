import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover, style }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl p-5 transition-all duration-200', hover && 'cursor-pointer', className)}
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        ...(hover ? {} : {}),
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--primary-border)';
        el.style.backgroundColor = 'var(--bg-elevated)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border)';
        el.style.backgroundColor = 'var(--bg-card)';
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('font-semibold', className)} style={{ color: 'var(--text-primary)' }}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}
