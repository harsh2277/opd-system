import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-[var(--neutral-200)]',
        hover && 'transition-all duration-200 hover:border-[var(--brand-300)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
