import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { FeedbackContext } from './feedback-context';

interface Notice {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

const NOTICE_DURATION_MS = 6000;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  const notify = useCallback(
    (kind: Notice['kind'], message: string) => {
      const id = nextId.current++;
      setNotices((current) => [...current, { id, kind, message }]);
      setTimeout(() => dismiss(id), NOTICE_DURATION_MS);
    },
    [dismiss],
  );

  const actions = useMemo(
    () => ({
      notifySuccess: (message: string) => notify('success', message),
      notifyError: (message: string) => notify('error', message),
    }),
    [notify],
  );

  return (
    <FeedbackContext value={actions}>
      {children}
      <div className="fixed right-4 bottom-4 left-4 z-50 flex flex-col items-end gap-2 sm:left-auto">
        {notices.map((notice) => (
          <div
            key={notice.id}
            role={notice.kind === 'error' ? 'alert' : 'status'}
            className={`flex w-full max-w-sm items-start gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg ${
              notice.kind === 'error' ? 'bg-red-700' : 'bg-emerald-700'
            }`}
          >
            <p className="flex-1">{notice.message}</p>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => dismiss(notice.id)}
              className="leading-none opacity-80 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext>
  );
}
