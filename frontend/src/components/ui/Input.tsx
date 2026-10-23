import type { InputHTMLAttributes, Ref } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  invalid?: boolean;
}

export function Input({
  invalid = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <input
      aria-invalid={invalid}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none disabled:bg-slate-100 ${invalid ? 'border-red-600' : 'border-slate-300'} ${className}`}
      {...props}
    />
  );
}
