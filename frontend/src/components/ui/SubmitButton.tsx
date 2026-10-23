import type { ReactNode } from 'react';
import { Button } from './Button';

interface SubmitButtonProps {
  isPending: boolean;
  children: ReactNode;
  variant?: 'primary' | 'danger';
  type?: 'submit' | 'button';
  onClick?: () => void;
}

export function SubmitButton({
  isPending,
  children,
  variant = 'primary',
  type = 'submit',
  onClick,
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      disabled={isPending}
      aria-busy={isPending}
      onClick={onClick}
    >
      {isPending ? 'Enviando…' : children}
    </Button>
  );
}
