import { useQuery } from '@tanstack/react-query';
import { getDeckDetail } from '../api/flashcardApi';

export function useDeckDetail(deckId: string) {
  return useQuery({
    queryKey: ['deck-detail', deckId],
    queryFn: () => getDeckDetail(deckId),
    enabled: Boolean(deckId),
  });
}
