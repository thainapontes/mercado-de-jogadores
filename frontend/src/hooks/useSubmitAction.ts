import { useCallback, useRef } from 'react';
import { useFeedback } from './useFeedback';

export function useSubmitAction<TVariables, TData>(
  mutateAsync: (variables: TVariables) => Promise<TData>,
  successMessage: string,
) {
  const { notifySuccess, notifyError } = useFeedback();
  const running = useRef(false);

  return useCallback(
    async (variables: TVariables): Promise<{ data: TData } | undefined> => {
      if (running.current) {
        return undefined;
      }
      running.current = true;
      try {
        const data = await mutateAsync(variables);
        notifySuccess(successMessage);
        return { data };
      } catch (error) {
        notifyError(
          error instanceof Error ? error.message : 'Erro inesperado.',
        );
        return undefined;
      } finally {
        running.current = false;
      }
    },
    [mutateAsync, notifySuccess, notifyError, successMessage],
  );
}
