import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { SubmitButton } from './SubmitButton';

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="text-sm text-slate-700">{message}</div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <SubmitButton
          type="button"
          variant="danger"
          isPending={isPending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </SubmitButton>
      </div>
    </Modal>
  );
}
