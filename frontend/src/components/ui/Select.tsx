import type { Ref, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  invalid?: boolean;
}

export function Select({
  invalid = false,
  className = '',
  ...props
}: SelectProps) {
  return (
    <select
      aria-invalid={invalid}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none disabled:bg-slate-100 ${invalid ? 'border-red-600' : 'border-slate-300'} ${className}`}
      {...props}
    />
  );
}
