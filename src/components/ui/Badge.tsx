import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'new' | 'returning' | 'on-duty' | 'off-duty' | 'waiting' | 'active' | 'done' | 'skipped' | 'urgent';
  className?: string;
}

export function Badge({ children, variant = 'new', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variant === 'new' && 'bg-[var(--success-100)] text-[var(--success-700)]',
        variant === 'returning' && 'bg-[var(--brand-100)] text-[var(--brand-700)]',
        variant === 'on-duty' && 'bg-[var(--success-100)] text-[var(--success-700)]',
        variant === 'off-duty' && 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
        variant === 'waiting' && 'bg-[var(--warning-100)] text-[var(--warning-500)]',
        variant === 'active' && 'bg-blue-100 text-blue-700',
        variant === 'done' && 'bg-[var(--success-100)] text-[var(--success-700)]',
        variant === 'skipped' && 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
        variant === 'urgent' && 'bg-[var(--error-100)] text-[var(--error-500)]',
        className
      )}
    >
      {children}
    </span>
  );
}
