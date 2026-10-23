import { createContext } from 'react';

export interface FeedbackActions {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
}

export const FeedbackContext = createContext<FeedbackActions | null>(null);
