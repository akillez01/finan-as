import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
        variant === 'default' && 'bg-primary text-white hover:opacity-90',
        variant === 'outline' && 'border border-border bg-white hover:bg-slate-50',
        variant === 'ghost' && 'hover:bg-slate-100',
        className,
      )}
      {...props}
    />
  );
}
