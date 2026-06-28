import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markVocabularyDifficult } from '../api/vocabularyApi';

export function useMarkVocabularyDifficult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markVocabularyDifficult,
    onSuccess: (_, vocabularyId) => {
      queryClient.invalidateQueries({ queryKey: ['me', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary', vocabularyId] });
      queryClient.invalidateQueries({ queryKey: ['reading'] });
    },
  });
}
