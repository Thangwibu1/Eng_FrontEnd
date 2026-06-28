import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewCard } from '../api/flashcardApi';

export function useReviewCard(deckId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewCard,
    onSuccess: () => {
      // Invalidate queries so review progress counts update
      queryClient.invalidateQueries({ queryKey: ['me', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-decks'] });
      if (deckId) {
        queryClient.invalidateQueries({ queryKey: ['deck-detail', deckId] });
      }
    },
  });
}
