import { useContext } from 'react';
import {
  FeedbackContext,
  type FeedbackActions,
} from '../components/ui/feedback-context';

export function useFeedback(): FeedbackActions {
  const actions = useContext(FeedbackContext);
  if (!actions) {
    throw new Error('useFeedback precisa estar dentro do FeedbackProvider.');
  }
  return actions;
}
