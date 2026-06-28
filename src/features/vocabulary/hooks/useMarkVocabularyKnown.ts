import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markVocabularyKnown } from '../api/vocabularyApi';

export function useMarkVocabularyKnown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markVocabularyKnown,
    onSuccess: (_, vocabularyId) => {
      queryClient.invalidateQueries({ queryKey: ['me', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary', vocabularyId] });
      queryClient.invalidateQueries({ queryKey: ['reading'] });
    },
  });
}
