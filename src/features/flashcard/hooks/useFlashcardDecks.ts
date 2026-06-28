import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyDecks, createDeck } from '../api/flashcardApi';

export function useFlashcardDecks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['my-decks'],
    queryFn: getMyDecks,
  });

  const createMutation = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-decks'] });
    },
  });

  return {
    ...query,
    createDeck: createMutation,
  };
}
